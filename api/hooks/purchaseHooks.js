// hooks/purchaseHooks.js

const RecommendationEngine = require('../services/recommendationEngine');

/**
 * Handles item purchase events and updates recommendation data accordingly.
 * 
 * @param {Object} item - The item that was purchased.
 * @param {String} userId - The ID of the user who made the purchase.
 */
const processPurchase = async (item, userId) => {
  try {
    await RecommendationEngine.processItemPurchase(item, userId);
  } catch (error) {
    console.error('Error processing item purchase in hook:', error);
  }
};

module.exports = {
  processPurchase
};
