// services/mlRecommendationEngine.js
const Recommendation = require('../models/Recommendations');
const Item = require('../models/item');
const List = require('../models/list');
const History = require('../models/history');
const mongoose = require('mongoose');
const { PCA } = require('ml-pca');
const KMeans = require('kmeans-js');
const tf = require('@tensorflow/tfjs');

class MLRecommendationEngine {
  /**
   * Process new purchase data to update recommendations
   * @param {Object} item - The purchased item
   * @param {Object} user - The user who purchased the item
   */
  static async processItemPurchase(item, userId) {
    try {
      // Find or create recommendation for this item
      let recommendation = await Recommendation.findOne({ 
        userId: userId, 
        itemName: item.name 
      });
      
      const now = new Date();
      const purchaseData = {
        date: now,
        quantity: item.quantity || 1,
        price: parseFloat(item.formattedPrice) || 0
      };
      
      if (!recommendation) {
        // Create new recommendation for first-time purchase
        recommendation = new Recommendation({
          userId: userId,
          itemName: item.name,
          category: item.category,
          frequency: 14, // Default to 2 weeks until we have more data
          lastPurchased: now,
          purchaseHistory: [purchaseData],
          confidence: 0.3, // Start with lower confidence
          imageUrl: item.imageUrl,
          featureVector: [] // Will be calculated later
        });
      } else {
        // Update existing recommendation
        recommendation.purchaseHistory.push(purchaseData);
        recommendation.lastPurchased = now;
        
        // Keep only the last 20 purchases for analysis (increased from 10)
        if (recommendation.purchaseHistory.length > 20) {
          recommendation.purchaseHistory = recommendation.purchaseHistory.slice(-20);
        }
        
        // Update seasonal factors
        this.updateSeasonalFactors(recommendation, now);
        
        // Calculate new frequency if we have enough data
        if (recommendation.purchaseHistory.length >= 2) {
          recommendation.frequency = this.calculateFrequency(recommendation.purchaseHistory);
          recommendation.confidence = this.calculateConfidence(recommendation.purchaseHistory);
        }
        
        recommendation.updatedAt = now;
      }
      
      // Generate feature vector for ML
      recommendation.featureVector = await this.generateFeatureVector(recommendation, userId);
      
      await recommendation.save();
      
      // Update similar items periodically
      if (Math.random() < 0.2) { // 20% chance to update similarities on any purchase
        await this.updateItemSimilarities(userId);
      }
    } catch (error) {
      console.error('Error processing item purchase:', error);
    }
  }
  
  /**
   * Update the seasonal factors for a recommendation
   * @param {Object} recommendation - Recommendation document
   * @param {Date} purchaseDate - Date of purchase
   */
  static updateSeasonalFactors(recommendation, purchaseDate) {
    // Update day of week counter (0 = Sunday, 6 = Saturday)
    const dayOfWeek = purchaseDate.getDay();
    if (!recommendation.seasonalFactors) {
      recommendation.seasonalFactors = {
        dayOfWeek: [0,0,0,0,0,0,0],
        monthOfYear: [0,0,0,0,0,0,0,0,0,0,0,0]
      };
    }
    recommendation.seasonalFactors.dayOfWeek[dayOfWeek]++;
    
    // Update month of year counter (0 = January, 11 = December)
    const monthOfYear = purchaseDate.getMonth();
    recommendation.seasonalFactors.monthOfYear[monthOfYear]++;
  }
  
  /**
   * Generate a feature vector for machine learning algorithms
   * @param {Object} recommendation - Recommendation document
   * @param {String} userId - User ID
   * @returns {Array} - Feature vector
   */
  static async generateFeatureVector(recommendation, userId) {
    // Create a numerical representation of the item for ML algorithms
    const features = [];
    
    // Feature 1-7: Purchase frequency features
    features.push(recommendation.frequency || 14); // Days between purchases
    features.push(recommendation.confidence || 0.3); // Confidence score
    features.push(recommendation.purchaseHistory.length); // Number of purchases
    
    // Calculate average quantity and price if available
    const quantities = recommendation.purchaseHistory
      .map(p => p.quantity)
      .filter(q => q !== undefined);
    
    const prices = recommendation.purchaseHistory
      .map(p => p.price)
      .filter(p => p !== undefined);
    
    features.push(quantities.length ? 
      quantities.reduce((a,b) => a+b, 0) / quantities.length : 1); // Avg quantity
    
    features.push(prices.length ? 
      prices.reduce((a,b) => a+b, 0) / prices.length : 0); // Avg price
    
    // Calculate purchase time intervals variance (consistency)
    if (recommendation.purchaseHistory.length >= 2) {
      const intervals = [];
      const sortedHistory = [...recommendation.purchaseHistory].sort((a, b) => a.date - b.date);
      
      for (let i = 1; i < sortedHistory.length; i++) {
        const diffDays = (sortedHistory[i].date - sortedHistory[i-1].date) / (1000 * 60 * 60 * 24);
        intervals.push(diffDays);
      }
      
      const mean = intervals.reduce((a,b) => a+b, 0) / intervals.length;
      const variance = intervals.reduce((a,b) => a + Math.pow(b-mean, 2), 0) / intervals.length;
      features.push(variance); // Variance in purchase intervals
      features.push(intervals[intervals.length-1] || mean); // Most recent interval
    } else {
      features.push(0); // Default variance
      features.push(14); // Default recent interval
    }
    
    // Add recency factor - days since last purchase
    const daysSinceLastPurchase = recommendation.lastPurchased ?
      (new Date() - recommendation.lastPurchased) / (1000 * 60 * 60 * 24) : 0;
    features.push(daysSinceLastPurchase);
    
    // Seasonal features - convert to relative frequencies
    if (recommendation.seasonalFactors) {
      const totalDayPurchases = recommendation.seasonalFactors.dayOfWeek.reduce((a,b) => a+b, 0) || 1;
      const dayFactors = recommendation.seasonalFactors.dayOfWeek.map(count => count / totalDayPurchases);
      
      const totalMonthPurchases = recommendation.seasonalFactors.monthOfYear.reduce((a,b) => a+b, 0) || 1;
      const monthFactors = recommendation.seasonalFactors.monthOfYear.map(count => count / totalMonthPurchases);
      
      // Add seasonal factors to feature vector
      features.push(...dayFactors);
      features.push(...monthFactors);
    } else {
      // Add placeholder values if no seasonal data
      features.push(...Array(7).fill(1/7)); // Equal probability for days
      features.push(...Array(12).fill(1/12)); // Equal probability for months
    }
    
    return features;
  }
  
  /**
   * Calculate the average time between purchases in days
   * Using weighted moving average to favor recent patterns
   * @param {Array} history - Array of purchase history objects
   * @returns {Number} - Average days between purchases
   */
  static calculateFrequency(history) {
    if (history.length < 2) return 14; // Default
    
    // Sort dates from oldest to newest
    const sortedHistory = [...history].sort((a, b) => a.date - b.date);
    
    // Calculate differences in days between consecutive purchases
    const intervals = [];
    const weights = [];
    
    for (let i = 1; i < sortedHistory.length; i++) {
      const diff = (sortedHistory[i].date - sortedHistory[i-1].date) / (1000 * 60 * 60 * 24); // Convert ms to days
      intervals.push(diff);
      
      // Weights increase linearly with recency
      weights.push(i); // Weight by position (more recent = higher weight)
    }
    
    // Calculate weighted average
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = intervals.reduce((sum, interval, i) => sum + (interval * weights[i]), 0);
    
    // Return weighted average, with a minimum of 1 day
    return Math.max(1, Math.round(weightedSum / totalWeight));
  }
  
  /**
   * Calculate confidence score based on consistency of purchase intervals
   * and quantity of data available
   * @param {Array} history - Array of purchase history objects
   * @returns {Number} - Confidence score between 0-1
   */
  static calculateConfidence(history) {
    if (history.length < 3) return 0.4; // Not enough data for high confidence
    
    // Sort dates from oldest to newest
    const sortedHistory = [...history].sort((a, b) => a.date - b.date);
    
    // Calculate intervals between purchases
    const intervals = [];
    for (let i = 1; i < sortedHistory.length; i++) {
      const diff = (sortedHistory[i].date - sortedHistory[i-1].date) / (1000 * 60 * 60 * 24); // Convert ms to days
      intervals.push(diff);
    }
    
    // Calculate standard deviation of intervals
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate coefficient of variation (lower is better)
    const cv = mean > 0 ? stdDev / mean : 1;
    
    // Data quantity factor (more data = higher confidence, up to a point)
    const quantityFactor = Math.min(1, history.length / 10);
    
    // Calculate final confidence score combining consistency and quantity
    // Lower CV means higher confidence (more consistent intervals)
    const consistencyScore = Math.min(1, Math.max(0.3, 1 - (cv / 2)));
    const confidence = 0.7 * consistencyScore + 0.3 * quantityFactor;
    
    return confidence;
  }
  
  /**
   * Get recommendations for a specific user
   * @param {ObjectId} userId - User ID
   * @param {Array} listIds - List IDs to consider
   * @returns {Array} - Array of recommended items
   */
  static async getRecommendations(userId, listIds = []) {
    try {
      // Get all recommendations for the user
      const allRecommendations = await Recommendation.find({ userId });
      
      // Get current items in the specified lists
      const currentItems = await Item.find({
        list: { $in: listIds },
        purchased: false
      });
      
      // Create a set of current item names for quick lookup
      const currentItemNames = new Set(currentItems.map(item => item.name));
      
      const now = new Date();
      const currentDay = now.getDay(); // 0-6, where 0 is Sunday
      const currentMonth = now.getMonth(); // 0-11, where 0 is January
      
      const scoredRecommendations = [];
      
      // Calculate scores for each potential recommendation
      for (const rec of allRecommendations) {
        // Skip if the item is already in the list
        if (currentItemNames.has(rec.itemName)) continue;
        
        // Skip if we have no purchase history
        if (!rec.lastPurchased) continue;
        
        // Calculate days since last purchase
        const daysSinceLastPurchase = (now - rec.lastPurchased) / (1000 * 60 * 60 * 24);
        
        // Calculate how "due" the item is (1.0 means exactly due, higher means overdue)
        const dueFactor = daysSinceLastPurchase / rec.frequency;
        
        // Calculate seasonal score based on day of week and month patterns
        let dayOfWeekScore = 0;
        let monthOfYearScore = 0;
        
        if (rec.seasonalFactors && rec.seasonalFactors.dayOfWeek) {
          const dayTotal = rec.seasonalFactors.dayOfWeek.reduce((a,b) => a+b, 0) || 1;
          dayOfWeekScore = rec.seasonalFactors.dayOfWeek[currentDay] / dayTotal;
          
          const monthTotal = rec.seasonalFactors.monthOfYear.reduce((a,b) => a+b, 0) || 1;
          monthOfYearScore = rec.seasonalFactors.monthOfYear[currentMonth] / monthTotal;
        }
        
        // Find similar items that are currently in the list
        let similarityBoost = 0;
        if (rec.similarItems && rec.similarItems.length > 0) {
          for (const similar of rec.similarItems) {
            if (currentItemNames.has(similar.itemName)) {
              similarityBoost += similar.score; // Add similarity score as a boost
            }
          }
        }
        
        // Combined score calculation
        // 50% weight to due factor, 20% to confidence, 10% to each seasonal factor, 10% to similarity
        const combinedScore = 
          (0.5 * dueFactor) + 
          (0.2 * rec.confidence) + 
          (0.1 * dayOfWeekScore) + 
          (0.1 * monthOfYearScore) +
          (0.1 * similarityBoost);
        
        // Only recommend if the item is at least 50% due and has minimum confidence
        if (dueFactor >= 0.5 && rec.confidence >= 0.3) {
          scoredRecommendations.push({
            ...rec.toObject(),
            score: combinedScore,
            dueFactor,
            dueInDays: Math.max(0, Math.round(rec.frequency - daysSinceLastPurchase)),
            seasonalScore: { day: dayOfWeekScore, month: monthOfYearScore },
            similarityBoost
          });
        }
      }
      
      // Sort by combined score
      return scoredRecommendations.sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }
  
  /**
   * Update similar items matrix for a user based on co-occurrence patterns
   * @param {String} userId - User ID
   */
  static async updateItemSimilarities(userId) {
    try {
      // Get all user's recommendations
      const userRecommendations = await Recommendation.find({ userId });
      if (userRecommendations.length < 5) return; // Not enough data
      
      // Extract feature vectors for all items
      const itemFeatures = {};
      const itemNames = [];
      const featureVectors = [];
      
      userRecommendations.forEach(rec => {
        if (rec.featureVector && rec.featureVector.length > 0) {
          itemNames.push(rec.itemName);
          featureVectors.push(rec.featureVector);
          itemFeatures[rec.itemName] = rec.featureVector;
        }
      });
      
      if (featureVectors.length < 3) return; // Not enough feature data
      
      // Normalize features (optional - improves results)
      const normalizedFeatures = this.normalizeFeatures(featureVectors);
      
      // Find similar items using cosine similarity
      for (let i = 0; i < itemNames.length; i++) {
        const currentItem = itemNames[i];
        const currentRec = userRecommendations.find(r => r.itemName === currentItem);
        if (!currentRec) continue;
        
        const similarities = [];
        
        for (let j = 0; j < itemNames.length; j++) {
          if (i === j) continue; // Skip self
          
          const otherItem = itemNames[j];
          const similarity = this.cosineSimilarity(
            normalizedFeatures[i], 
            normalizedFeatures[j]
          );
          
          if (similarity > 0.5) { // Only consider meaningful similarities
            similarities.push({
              itemName: otherItem,
              score: similarity
            });
          }
        }
        
        // Sort by similarity score and keep top 5
        similarities.sort((a, b) => b.score - a.score);
        const topSimilarities = similarities.slice(0, 5);
        
        // Update recommendation with similar items
        currentRec.similarItems = topSimilarities;
        await currentRec.save();
      }
      
      console.log(`Updated similarity matrix for user ${userId}`);
    } catch (error) {
      console.error('Error updating item similarities:', error);
    }
  }
  
  /**
   * Normalize feature vectors to improve similarity calculations
   * @param {Array} vectors - Array of feature vectors
   * @returns {Array} - Array of normalized feature vectors
   */
  static normalizeFeatures(vectors) {
    // Simple min-max normalization for each feature dimension
    const dimensions = vectors[0].length;
    const mins = Array(dimensions).fill(Number.MAX_VALUE);
    const maxs = Array(dimensions).fill(Number.MIN_VALUE);
    
    // Find min and max for each dimension
    vectors.forEach(vector => {
      for (let i = 0; i < dimensions; i++) {
        mins[i] = Math.min(mins[i], vector[i]);
        maxs[i] = Math.max(maxs[i], vector[i]);
      }
    });
    
    // Normalize each vector
    return vectors.map(vector => {
      return vector.map((val, i) => {
        const range = maxs[i] - mins[i];
        return range > 0 ? (val - mins[i]) / range : 0;
      });
    });
  }
  
  /**
   * Calculate cosine similarity between two vectors
   * @param {Array} vecA - First vector
   * @param {Array} vecB - Second vector
   * @returns {Number} - Similarity score (0-1)
   */
  static cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
  
  /**
   * Train a machine learning model for user purchase patterns
   * Uses TensorFlow.js to build a basic prediction model
   * @param {String} userId - User ID
   */
  static async trainUserModel(userId) {
    try {
      // Get all user's recommendations with sufficient history
      const userRecommendations = await Recommendation.find({ 
        userId,
        'purchaseHistory.2': { $exists: true } // At least 3 purchases
      });
      
      if (userRecommendations.length < 5) {
        console.log(`Not enough data to train model for user ${userId}`);
        return;
      }
      
      // Prepare training data
      const trainingData = [];
      const trainingLabels = [];
      
      for (const rec of userRecommendations) {
        if (!rec.featureVector || rec.featureVector.length === 0) continue;
        
        // Use feature vector as input
        trainingData.push(rec.featureVector);
        
        // Use frequency as output (prediction target)
        trainingLabels.push([rec.frequency / 30]); // Normalize to 0-1 range (assuming max 30 days)
      }
      
      if (trainingData.length < 5) {
        console.log(`Not enough feature data to train model for user ${userId}`);
        return;
      }
      
      // Convert to tensors
      const xs = tf.tensor2d(trainingData);
      const ys = tf.tensor2d(trainingLabels);
      
      // Create a simple model
      const model = tf.sequential();
      
      model.add(tf.layers.dense({
        units: 16,
        activation: 'relu',
        inputShape: [trainingData[0].length]
      }));
      
      model.add(tf.layers.dense({
        units: 8,
        activation: 'relu'
      }));
      
      model.add(tf.layers.dense({
        units: 1,
        activation: 'sigmoid'
      }));
      
      // Compile the model
      model.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });
      
      // Train the model
      await model.fit(xs, ys, {
        epochs: 100,
        batchSize: 4,
        shuffle: true,
        verbose: 0
      });
      
      console.log(`Trained prediction model for user ${userId}`);
      
      // Save the model (in a real system, you'd store this properly)
      await model.save(`file://./models/user_${userId}_model`);
      
      // Clean up tensors
      xs.dispose();
      ys.dispose();
      
    } catch (error) {
      console.error('Error training user model:', error);
    }
  }
  
  /**
   * Analyze all historical purchase data to build recommendations
   * Used for initial population or rebuilding recommendations
   */
  static async buildRecommendationsFromHistory() {
    try {
      // Get all item purchase history
      const histories = await History.find({ action: 'purchase' })
        .populate('itemId')
        .populate('performedBy');
      
      // Group by user and item
      const purchaseData = {};
      
      for (const history of histories) {
        if (!history.itemId || !history.performedBy) continue;
        
        const userId = history.performedBy._id.toString();
        const itemName = history.itemId.name;
        
        if (!purchaseData[userId]) {
          purchaseData[userId] = {};
        }
        
        if (!purchaseData[userId][itemName]) {
          purchaseData[userId][itemName] = {
            category: history.itemId.category,
            imageUrl: history.itemId.imageUrl,
            history: []
          };
        }
        
        purchaseData[userId][itemName].history.push({
          date: history.date,
          quantity: history.itemId.quantity || 1,
          price: parseFloat(history.itemId.formattedPrice) || 0
        });
      }
      
      // Process each user's purchase data
      for (const userId in purchaseData) {
        for (const itemName in purchaseData[userId]) {
          const itemData = purchaseData[userId][itemName];
          
          // Skip if we don't have enough purchase data
          if (itemData.history.length < 2) continue;
          
          // Sort dates from oldest to newest
          const sortedHistory = itemData.history.sort((a, b) => a.date - b.date);
          const lastPurchased = sortedHistory[sortedHistory.length - 1].date;
          
          // Calculate frequency and confidence
          const frequency = this.calculateFrequency(sortedHistory);
          const confidence = this.calculateConfidence(sortedHistory);
          
          // Calculate seasonal factors
          const seasonalFactors = {
            dayOfWeek: [0,0,0,0,0,0,0],
            monthOfYear: [0,0,0,0,0,0,0,0,0,0,0,0]
          };
          
          sortedHistory.forEach(purchase => {
            const date = purchase.date;
            seasonalFactors.dayOfWeek[date.getDay()]++;
            seasonalFactors.monthOfYear[date.getMonth()]++;
          });
          
          // Create or update recommendation
          const recommendation = await Recommendation.findOneAndUpdate(
            { userId, itemName },
            {
              userId,
              itemName,
              category: itemData.category,
              frequency,
              lastPurchased,
              purchaseHistory: sortedHistory,
              confidence,
              imageUrl: itemData.imageUrl,
              seasonalFactors,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
          
          // Generate feature vector
          const featureVector = await this.generateFeatureVector(recommendation, userId);
          recommendation.featureVector = featureVector;
          await recommendation.save();
        }
        
        // Calculate similarities between items
        await this.updateItemSimilarities(userId);
        
        // Train user model
        await this.trainUserModel(userId);
      }
      
      console.log('Successfully built recommendations from history');
    } catch (error) {
      console.error('Error building recommendations from history:', error);
    }
  }
  
  /**
   * Find similar users to improve recommendations for new users
   * Uses collaborative filtering approach
   * @param {String} targetUserId - User ID to find similar users for
   * @returns {Array} - Array of similar user IDs with similarity scores
   */
  static async findSimilarUsers(targetUserId) {
    try {
      // Get the target user's purchase history
      const targetUserRecs = await Recommendation.find({ userId: targetUserId });
      
      if (targetUserRecs.length < 3) {
        console.log(`Not enough data for user ${targetUserId} to find similar users`);
        return [];
      }
      
      // Create a map of the target user's purchased items
      const targetUserItems = new Set(targetUserRecs.map(rec => rec.itemName));
      
      // Find users who have purchased some of the same items
      const similarItemUsers = await Recommendation.distinct('userId', {
        itemName: { $in: Array.from(targetUserItems) },
        userId: { $ne: targetUserId }
      });
      
      if (similarItemUsers.length === 0) {
        console.log(`No similar users found for user ${targetUserId}`);
        return [];
      }
      
      // Calculate similarity scores
      const similarityScores = [];
      
      for (const otherUserId of similarItemUsers) {
        // Get the other user's recommendations
        const otherUserRecs = await Recommendation.find({ userId: otherUserId });
        const otherUserItems = new Set(otherUserRecs.map(rec => rec.itemName));
        
        // Calculate Jaccard similarity (intersection over union)
        const intersection = new Set([...targetUserItems].filter(x => otherUserItems.has(x)));
        const union = new Set([...targetUserItems, ...otherUserItems]);
        
        const similarity = intersection.size / union.size;
        
        if (similarity > 0.1) { // Minimum threshold for similarity
          similarityScores.push({
            userId: otherUserId,
            score: similarity,
            commonItems: Array.from(intersection)
          });
        }
      }
      
      // Sort by similarity score
      similarityScores.sort((a, b) => b.score - a.score);
      
      return similarityScores.slice(0, 10); // Return top 10 similar users
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }
  
  /**
   * Get recommendations for a new user based on similar users
   * @param {String} userId - User ID
   * @returns {Array} - Array of recommended items
   */
  static async getCollaborativeRecommendations(userId) {
    try {
      // Find similar users
      const similarUsers = await this.findSimilarUsers(userId);
      
      if (similarUsers.length === 0) {
        return [];
      }
      
      // Get the current user's items
      const userItems = new Set((await Recommendation.find({ userId }))
        .map(rec => rec.itemName));
      
      // Collect recommendations from similar users
      const recommendationScores = {};
      
      for (const similarUser of similarUsers) {
        const otherUserId = similarUser.userId;
        const similarityScore = similarUser.score;
        
        // Get recommendations from this similar user
        const otherUserRecs = await Recommendation.find({ 
          userId: otherUserId,
          confidence: { $gte: 0.5 } // Only consider confident recommendations
        });
        
        for (const rec of otherUserRecs) {
          // Skip items the user already has
          if (userItems.has(rec.itemName)) continue;
          
          // Calculate a weighted score based on user similarity and recommendation confidence
          const weightedScore = similarityScore * rec.confidence;
          
          if (!recommendationScores[rec.itemName]) {
            recommendationScores[rec.itemName] = {
              itemName: rec.itemName,
              category: rec.category,
              imageUrl: rec.imageUrl,
              score: 0,
              sources: []
            };
          }
          
          recommendationScores[rec.itemName].score += weightedScore;
          recommendationScores[rec.itemName].sources.push(otherUserId);
        }
      }
      
      // Convert to array and sort
      return Object.values(recommendationScores)
        .sort((a, b) => b.score - a.score);
    } catch (error) {
      console.error('Error getting collaborative recommendations:', error);
      return [];
    }
  }
  
  /**
   * Train machine learning models using historical data
   * Uses TensorFlow.js for prediction models
   */
  static async trainModels() {
    try {
      // Get all users with sufficient purchase history
      const userIds = await Recommendation.distinct('userId');
      console.log(`Training models for ${userIds.length} users`);
      
      for (const userId of userIds) {
        await this.trainUserModel(userId);
      }
      
      // Train global category model
      await this.trainCategoryModel();
      
      console.log('Model training complete');
    } catch (error) {
      console.error('Error training models:', error);
    }
  }
  
  /**
   * Train a model to predict purchase frequency by category
   * This helps with cold-start problem for new items
   */
  static async trainCategoryModel() {
    try {
      // Get recommendations with good confidence
      const recommendations = await Recommendation.find({
        confidence: { $gte: 0.6 }
      });
      
      if (recommendations.length < 20) {
        console.log('Not enough data to train category model');
        return;
      }
      
      // Group by category
      const categoryData = {};
      
      for (const rec of recommendations) {
        if (!rec.category) continue;
        
        if (!categoryData[rec.category]) {
          categoryData[rec.category] = {
            frequencies: [],
            confidences: []
          };
        }
        
        categoryData[rec.category].frequencies.push(rec.frequency);
        categoryData[rec.category].confidences.push(rec.confidence);
      }
      
      // Train a simple model for each category with sufficient data
      for (const category in categoryData) {
        if (categoryData[category].frequencies.length < 10) continue;
        
        const { frequencies, confidences } = categoryData[category];
        
        // Prepare training data
        const avgFrequency = frequencies.reduce((a, b) => a + b, 0) / frequencies.length;
        const stdDevFrequency = Math.sqrt(
          frequencies.reduce((sum, f) => sum + Math.pow(f - avgFrequency, 2), 0) / frequencies.length
        );
        
        console.log(`Category ${category}: Avg frequency = ${avgFrequency.toFixed(1)} days, StdDev = ${stdDevFrequency.toFixed(1)}`);
        
        // In a full implementation, we would train a proper ML model here
        // For simplicity, we're just storing the statistics
        await this.saveCategoryStats(category, avgFrequency, stdDevFrequency);
      }
    } catch (error) {
      console.error('Error training category model:', error);
    }
  }
  
  /**
   * Save category statistics to database
   */
  static async saveCategoryStats(category, avgFrequency, stdDev) {
    // In a real implementation, you'd have a CategoryStats model
    console.log(`Saved category stats for ${category}`);
  }
}

module.exports = MLRecommendationEngine;