const express = require('express');
const router = express.Router();
const checkAuth = require('../middlewares/checkAuth'); // Import checkAuth middleware
const { getHistory } = require('../controllers/history');

// Route to get the history of changes
router.get('/', checkAuth, getHistory);

module.exports = router;
