const express = require('express');
const router = express.Router();

const {
  getAllItems,
  createItem,
  updateItem,
  deleteItem,
  markItemPurchased,
  searchItem,
  getHistory,
} = require('../controllers/items');
const checkAuth = require('../middlewares/checkAuth');

// Define routes
router.get('/', checkAuth, getAllItems);
router.post('/', checkAuth, createItem);
router.put('/:id', checkAuth, updateItem);
router.delete('/:id', checkAuth, deleteItem);
router.put('/:id/purchased', checkAuth, markItemPurchased);
router.get('/history', checkAuth, getHistory);
router.get('/search', checkAuth, searchItem);

module.exports = router;