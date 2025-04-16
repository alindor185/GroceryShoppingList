// services/recommendationEngine.js
const Recommendation = require('../models/Recommendations');
const Item = require('../models/item');
const List = require('../models/list');
const History = require('../models/history');
const mongoose = require('mongoose');

class RecommendationEngine {
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
      
      if (!recommendation) {
        // Create new recommendation for first-time purchase
        recommendation = new Recommendation({
          userId: userId,
          itemName: item.name,
          category: item.category,
          frequency: 14, // Default to 2 weeks until we have more data
          lastPurchased: now,
          purchaseHistory: [{ date: now }],
          confidence: 0.3, // Start with lower confidence
          imageUrl: item.imageUrl
        });
      } else {
        // Update existing recommendation
        // Add this purchase to history
        recommendation.purchaseHistory.push({ date: now });
        recommendation.lastPurchased = now;
        
        // Keep only the last 10 purchases for analysis
        if (recommendation.purchaseHistory.length > 10) {
          recommendation.purchaseHistory = recommendation.purchaseHistory.slice(-10);
        }
        
        // Calculate new frequency if we have enough data
        if (recommendation.purchaseHistory.length >= 2) {
          recommendation.frequency = this.calculateFrequency(recommendation.purchaseHistory);
          recommendation.confidence = this.calculateConfidence(recommendation.purchaseHistory);
        }
        
        recommendation.updatedAt = now;
      }
      
      await recommendation.save();
    } catch (error) {
      console.error('Error processing item purchase:', error);
    }
  }
  
  /**
   * Calculate the average time between purchases in days
   * @param {Array} history - Array of purchase dates
   * @returns {Number} - Average days between purchases
   */
  static calculateFrequency(history) {
    if (history.length < 2) return 14; // Default
    
    // Sort dates from oldest to newest
    const sortedDates = history
      .map(h => h.date)
      .sort((a, b) => a - b);
    
    // Calculate differences in days between consecutive purchases
    let totalDays = 0;
    let intervals = 0;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24); // Convert ms to days
      totalDays += diff;
      intervals++;
    }
    
    // Return average interval, with a minimum of 1 day
    return Math.max(1, Math.round(totalDays / intervals));
  }
  
  /**
   * Calculate confidence score based on consistency of purchase intervals
   * @param {Array} history - Array of purchase dates
   * @returns {Number} - Confidence score between 0-1
   */
  static calculateConfidence(history) {
    if (history.length < 3) return 0.4; // Not enough data for high confidence
    
    // Sort dates from oldest to newest
    const sortedDates = history
      .map(h => h.date)
      .sort((a, b) => a - b);
    
    // Calculate intervals between purchases
    const intervals = [];
    for (let i = 1; i < sortedDates.length; i++) {
      const diff = (sortedDates[i] - sortedDates[i-1]) / (1000 * 60 * 60 * 24); // Convert ms to days
      intervals.push(diff);
    }
    
    // Calculate standard deviation of intervals
    const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate coefficient of variation (lower is better)
    const cv = stdDev / mean;
    
    // Convert to confidence score (0-1)
    // Lower CV means higher confidence (more consistent intervals)
    const confidence = Math.min(1, Math.max(0.3, 1 - (cv / 2)));
    
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
      const recommendations = [];
      
      // Filter to items that are due to be purchased again
      for (const rec of allRecommendations) {
        // Skip if the item is already in the list
        if (currentItemNames.has(rec.itemName)) continue;
        
        // Skip if we have no purchase history
        if (!rec.lastPurchased) continue;
        
        // Calculate days since last purchase
        const daysSinceLastPurchase = (now - rec.lastPurchased) / (1000 * 60 * 60 * 24);
        
        // Calculate how "due" the item is (1.0 means exactly due, higher means overdue)
        const dueFactor = daysSinceLastPurchase / rec.frequency;
        
        // Only recommend if the item is at least 80% due and has good confidence
        if (dueFactor >= 0.8 && rec.confidence >= 0.4) {
          recommendations.push({
            ...rec.toObject(),
            dueFactor,
            dueInDays: Math.max(0, Math.round(rec.frequency - daysSinceLastPurchase))
          });
        }
      }
      
      // Sort by a combination of due factor and confidence
      return recommendations.sort((a, b) => {
        const scoreA = a.dueFactor * a.confidence;
        const scoreB = b.dueFactor * b.confidence;
        return scoreB - scoreA; // Higher score first
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
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
            dates: []
          };
        }
        
        purchaseData[userId][itemName].dates.push(history.date);
      }
      
      // Process each user's purchase data
      for (const userId in purchaseData) {
        for (const itemName in purchaseData[userId]) {
          const itemData = purchaseData[userId][itemName];
          
          // Skip if we don't have enough purchase data
          if (itemData.dates.length < 2) continue;
          
          // Calculate frequency and confidence
          const sortedDates = itemData.dates.sort((a, b) => a - b);
          const lastPurchased = sortedDates[sortedDates.length - 1];
          
          const purchaseHistory = sortedDates.map(date => ({ date }));
          const frequency = this.calculateFrequency(purchaseHistory);
          const confidence = this.calculateConfidence(purchaseHistory);
          
          // Update or create recommendation
          await Recommendation.findOneAndUpdate(
            { userId, itemName },
            {
              userId,
              itemName,
              category: itemData.category,
              frequency,
              lastPurchased,
              purchaseHistory,
              confidence,
              imageUrl: itemData.imageUrl,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
        }
      }
      
      console.log('Successfully built recommendations from history');
    } catch (error) {
      console.error('Error building recommendations from history:', error);
    }
  }
  
  /**
   * Find similar users to improve recommendations for new users
   * Uses collaborative filtering approach
   */
  static async findSimilarUsers(userId) {
    // This is a more advanced feature that could be implemented later
    // It would analyze purchase patterns across users to find similarities
    // and use those to enhance recommendations for users with limited history
  }
}

module.exports = RecommendationEngine;