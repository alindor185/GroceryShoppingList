const express = require('express');
const router = express.Router();
const listController = require('../controllers/lists'); // Import controller
const checkAuth = require('../middlewares/checkAuth'); // Middleware for authentication

// Define routes
router.get('/', checkAuth, listController.getLists);
router.get('/:listId/details', checkAuth, listController.getListDetails);
router.post('/', checkAuth, listController.createList);
router.post('/:listId/add-item', checkAuth, listController.addItemToList);
router.put('/:listId/items/:itemId', checkAuth, listController.updateItemInList);
router.delete('/:listId/items/:itemId', checkAuth, listController.deleteItemFromList);
router.put('/:listId/items/:itemId/purchased', checkAuth, listController.markItemPurchasedInList);
router.post('/undo', checkAuth, listController.undoLastAction);
router.get('/:listId/recommendations', checkAuth, listController.getRecommendations);


module.exports = router;
