const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Recommendation = require('../models/Recommendations');
const MLRecommendationEngine = require('../controllers/mlrecommendationEngine');
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
      const list = await List.findOne({
        _id: listIdQuery,
        members: userId,
        completed: false,
        isArchived: false
      });

      if (!list) {
        return res.status(403).json({ message: "Access denied to this list." });
      }
      listIds = [listIdQuery];
    } else {
      const userLists = await List.find({
        members: userId,
        completed: false,
        isArchived: false
      });
      listIds = userLists.map(list => list._id);
    }

    console.log("⚙️ Generating ML-powered recommendations...");
    const recommendations = await MLRecommendationEngine.getRecommendations(userId, listIds);
    
    // Check if we have enough recommendations
    let finalRecommendations = recommendations.slice(0, 5);
    
    // If we have a new user with few recommendations, supplement with collaborative filtering
    if (finalRecommendations.length < 3) {
      console.log("🤝 Adding collaborative recommendations for new user");
      const collaborativeRecs = await MLRecommendationEngine.getCollaborativeRecommendations(userId);
      
      // Add only new items not already in recommendations
      const existingItems = new Set(finalRecommendations.map(r => r.itemName));
      
      for (const colRec of collaborativeRecs) {
        if (!existingItems.has(colRec.itemName) && finalRecommendations.length < 5) {
          finalRecommendations.push({
            itemName: colRec.itemName,
            category: colRec.category,
            imageUrl: colRec.imageUrl,
            confidence: 0.4,
            frequency: 14, // Default for collaborative recs
            score: colRec.score * 0.7, // Slightly lower score for collaborative recs
            isCollaborative: true
          });
          existingItems.add(colRec.itemName);
        }
      }
    }

    console.log(`✅ Returning ${finalRecommendations.length} recommendations`);
    res.status(200).json({
      count: finalRecommendations.length,
      recommendations: finalRecommendations
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
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const list = await List.findOne({
      _id: listId,
      members: userId
    });

    if (!list) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const recommendation = await Recommendation.findOne({
      userId: userId,
      itemName
    });

    // Create new item and add to list
    const newItem = new Item({
      _id: new mongoose.Types.ObjectId(),
      name: itemName,
      category: category || (recommendation ? recommendation.category : 'Other'),
      quantity: 1,
      imageUrl: imageUrl || (recommendation ? recommendation.imageUrl : null),
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
    console.log("⚙️ Rebuilding ML recommendations from history...");
    await MLRecommendationEngine.buildRecommendationsFromHistory();
    console.log("✅ Recommendations rebuilt successfully");
    res.status(200).json({ message: 'Recommendations rebuilt successfully' });
  } catch (error) {
    console.error('❌ Error rebuilding recommendations:', error);
    res.status(500).json({ message: 'Failed to rebuild recommendations' });
  }
});

/**
 * POST /api/recommendations/train-models
 * Admin: Train machine learning models
 */
router.post('/train-models', auth, async (req, res) => {
  try {
    console.log("🧠 Training machine learning models...");
    await MLRecommendationEngine.trainModels();
    console.log("✅ Models trained successfully");
    res.status(200).json({ message: 'ML models trained successfully' });
  } catch (error) {
    console.error('❌ Error training models:', error);
    res.status(500).json({ message: 'Failed to train models' });
  }
});

module.exports = router;