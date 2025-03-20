const mongoose = require('mongoose');

module.exports = {
  // Fetch history for a specific or list
  getHistory: async (req, res) => {
    const { List, History } = mongoose.models;

    try {
      const { listId } = req.query; // Ensure listId is taken from req.query
      const userId = req.user.id; // Get user ID from req.user

      const list = await List.findById(listId); // Fetch list from database
      if (!list) { // If list not found, send 404 response
        return res.status(404).json({ message: 'List not found' });
      }
      // Debug: Log user ID and listId for troubleshooting
      console.log('Fetching history for user:', userId, 'and listId:', listId);

      // Build query object for History model
      const query = { list: listId }; // Query based on ID

      // Fetch history from database
      const history = await History.find(query)
        .populate('list', 'name') // Populate field with name
        .populate('performedBy', 'email') // Populate performedBy field with email
        .populate('itemId', 'name') // Populate itemId field with name
        .sort({ date: -1 }); // Sort history by date (most recent first)

      // Debug: Log fetched history
      console.log('Fetched history:', history);

      // Return history as response
      res.status(200).json({ history });
    } catch (error) {
      // Log error and send appropriate response
      console.error('Error fetching history:', error);
      res.status(500).json({ message: 'Failed to fetch history', error });
    }
  },
};
