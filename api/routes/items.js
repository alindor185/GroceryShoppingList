const express = require('express');
const router = express.Router();

const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  markItemPurchased,
  getHistory,
} = require('../controllers/items');

// Define routes
router.get('/', getAllItems);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);
router.put('/:id/purchased', markItemPurchased);
router.get('/history', getHistory);

module.exports = router;
