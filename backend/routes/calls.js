const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateToken, endCall } = require('../controllers/callController');

// @route   GET /api/calls/:groupId/token
// @desc    Generate Agora RTC token for group call
// @access  Private
router.get('/:groupId/token', protect, generateToken);

// @route   PUT /api/calls/:groupId/end
// @desc    End a group call
// @access  Private
router.put('/:groupId/end', protect, endCall);

module.exports = router;
