const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { 
  createGroup, 
  getMyGroups, 
  getGroupById, 
  inviteToGroup, 
  acceptInvitation, 
  rejectInvitation, 
  getMyInvitations,
  deleteGroup 
} = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

// @route   POST /api/groups
// @desc    Create a new group
// @access  Private
router.post(
  '/',
  protect,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty()
  ],
  createGroup
);

// @route   GET /api/groups
// @desc    Get all groups for current user
// @access  Private
router.get('/', protect, getMyGroups);

// @route   GET /api/groups/invitations
// @desc    Get all pending invitations for current user
// @access  Private
router.get('/invitations', protect, getMyInvitations);

// @route   GET /api/groups/:id
// @desc    Get a group by ID
// @access  Private
router.get('/:id', protect, getGroupById);

// @route   POST /api/groups/:id/invite
// @desc    Invite user to group
// @access  Private
router.post(
  '/:id/invite',
  protect,
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  inviteToGroup
);

// @route   PUT /api/groups/invitations/:id/accept
// @desc    Accept group invitation
// @access  Private
router.put('/invitations/:id/accept', protect, acceptInvitation);

// @route   PUT /api/groups/invitations/:id/reject
// @desc    Reject group invitation
// @access  Private
router.put('/invitations/:id/reject', protect, rejectInvitation);

// @route   DELETE /api/groups/:id
// @desc    Delete a group
// @access  Private (Admin only)
router.delete('/:id', protect, deleteGroup);

module.exports = router;
