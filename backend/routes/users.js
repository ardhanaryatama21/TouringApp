const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// @route   GET /api/users/search
// @desc    Search users by username, email, or full name
// @access  Private
router.get('/search', protect, searchUsers);

module.exports = router;
