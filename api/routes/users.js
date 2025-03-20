const express = require('express');
const router = express.Router();


const {
    signup,
    login,
    userDetails,
    updateUserDetails
} = require('../controllers/users');
const checkAuth = require('../middlewares/checkAuth');

router.post('/signup', signup);
router.post('/login', login);
router.get('/user', checkAuth, userDetails);
router.put('/user', checkAuth, updateUserDetails);


module.exports = router;