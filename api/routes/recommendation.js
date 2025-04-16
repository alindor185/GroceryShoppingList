const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recommendation = require('../models/Recommendations');
const RecommendationEngine = require('../controllers/recommendationEngine');
const auth = require('../routes/auth');
const List = require('../models/list');
const Item = require('../models/item');

/**
 * GET /api/recommendations?listId=xyz
 * Get top 5 recommendations for the user
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const listIdQuery = req.query.listId;
    let listIds = [];

    console.log("🔍 GET /api/recommendations called by user:", userId);
    console.log("📥 Query listId:", listIdQuery);

    if (listIdQuery) {
      console.log("🔎 Validating access to specific list...");
      const list = await List.findOne({
        _id: listIdQuery,
        members: userId,
        completed: false,
        isArchived: false
      });

      if (!list) {
        console.warn("⛔ Access denied to list:", listIdQuery);
        return res.status(403).json({ message: "Access denied to this list." });
      }

      console.log("✅ Access granted to list:", listIdQuery);
      listIds = [listIdQuery];
    } else {
      console.log("📋 No listId provided. Fetching user's active lists...");
      const userLists = await List.find({
        members: userId,
        completed: false,
        isArchived: false
      });

      listIds = userLists.map(list => list._id);
      console.log(`✅ Found ${listIds.length} active lists for user.`);
    }

    console.log("⚙️ Generating recommendations...");
    const recommendations = await RecommendationEngine.getRecommendations(userId, listIds);
    const topRecommendations = recommendations.slice(0, 5);

    console.log(`✅ Returning ${topRecommendations.length} recommendations`);
    res.status(200).json({
      count: topRecommendations.length,
      recommendations: topRecommendations
    });
  } catch (error) {
    console.error('❌ Error in GET /api/recommendations:', error);
    res.status(500).json({ message: 'Failed to fetch recommendations' });
  }
});

/**
 * POST /api/recommendations/add-to-list
 * Add a recommended item to the list
 */
router.post('/add-to-list', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, itemName, category, imageUrl } = req.body;

    console.log("🛒 POST /api/recommendations/add-to-list by user:", userId);
    console.log("📦 Item:", itemName, "| List ID:", listId);

    if (!listId || !itemName) {
      console.warn("⚠️ Missing required fields");
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const list = await List.findOne({
      _id: listId,
      members: userId
    });

    if (!list) {
      console.warn("⛔ User has no access to list:", listId);
      return res.status(403).json({ message: 'Access denied' });
    }

    const recommendation = await Recommendation.findOne({
      userId: userId,
      itemName
    });

    if (!recommendation) {
      console.warn("❌ Recommendation not found for item:", itemName);
      return res.status(404).json({ message: 'Recommendation not found' });
    }

    const newItem = new Item({
      _id: new mongoose.Types.ObjectId(),
      name: itemName,
      category: category || recommendation.category,
      quantity: 1,
      imageUrl: imageUrl || recommendation.imageUrl,
      formattedPrice: '0.00',
      list: listId,
      addedBy: userId,
      purchased: false
    });

    await newItem.save();

    list.items.push(newItem._id);
    list.updatedAt = Date.now();
    await list.save();

    console.log("✅ Item successfully added to list:", newItem.name);
    res.status(201).json({
      message: 'Item added successfully',
      item: newItem
    });
  } catch (error) {
    console.error('❌ Error adding recommended item:', error);
    res.status(500).json({ message: 'Failed to add item' });
  }
});

/**
 * POST /api/recommendations/rebuild
 * Admin: Rebuild recommendations from history
 */
router.post('/rebuild', auth, async (req, res) => {
  try {
    console.log("⚙️ Rebuilding recommendations from history...");
    await RecommendationEngine.buildRecommendationsFromHistory();
    console.log("✅ Recommendations rebuilt successfully");
    res.status(200).json({ message: 'Recommendations rebuilt successfully' });
  } catch (error) {
    console.error('❌ Error rebuilding recommendations:', error);
    res.status(500).json({ message: 'Failed to rebuild recommendations' });
  }
});

module.exports = router;
