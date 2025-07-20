const Group = require('../models/group');
const User = require('../models/user');
const Invitation = require('../models/invitation');
const { validationResult } = require('express-validator');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
exports.createGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false, 
      errors: errors.array(),
      message: 'Validasi gagal. Pastikan semua field diisi dengan benar.'
    });
  }

  const { name, description, category, icon } = req.body;
  console.log('Creating group with data:', { name, description, category, icon });
  console.log('User ID:', req.user._id);

  try {
    // Create new group
    const group = await Group.create({
      name,
      description,
      category: category || 'Lainnya',
      icon: icon || 'travel',
      creator: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    console.log('Group created:', group._id);

    // Add group to user's groups
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { groups: group._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Grup berhasil dibuat',
      _id: group._id,
      name: group.name,
      description: group.description,
      category: group.category,
      icon: group.icon
    });
  } catch (error) {
    console.error('Error creating group:', error.message);
    res.status(500).json({ 
      success: false, 
      message: `Gagal membuat grup: ${error.message}` 
    });
  }
};

// @desc    Get all groups for current user
// @route   GET /api/groups
// @access  Private
exports.getMyGroups = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('groups');
    res.json(user.groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a group by ID
// @route   GET /api/groups/:id
// @access  Private
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members.user', 'username fullName email profilePicture')
      .populate('creator', 'username fullName email profilePicture');

    if (group) {
      // Check if user is a member of the group
      const isMember = group.members.some(
        member => member.user._id.toString() === req.user._id.toString()
      );

      if (!isMember) {
        return res.status(403).json({ message: 'Not authorized to access this group' });
      }

      res.json(group);
    } else {
      res.status(404).json({ message: 'Group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite user to group
// @route   POST /api/groups/:id/invite
// @access  Private
exports.inviteToGroup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    // Find the group
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if user is admin of the group
    const isAdmin = group.members.some(
      member => 
        member.user.toString() === req.user._id.toString() && 
        member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ message: 'Only admins can invite users' });
    }

    // Find the user to invite
    const userToInvite = await User.findOne({ email });

    if (!userToInvite) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is already a member
    const isMember = group.members.some(
      member => member.user.toString() === userToInvite._id.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    // Check if invitation already exists
    const invitationExists = await Invitation.findOne({
      group: group._id,
      invitedUser: userToInvite._id,
      status: 'pending'
    });

    if (invitationExists) {
      return res.status(400).json({ message: 'Invitation already sent to this user' });
    }

    // Create invitation
    const invitation = await Invitation.create({
      group: group._id,
      invitedBy: req.user._id,
      invitedUser: userToInvite._id
    });

    // Add invitation to group
    group.invitations.push(invitation._id);
    await group.save();

    res.status(201).json({ message: 'Invitation sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept group invitation
// @route   PUT /api/groups/invitations/:id/accept
// @access  Private
exports.acceptInvitation = async (req, res) => {
  try {
    // Find the invitation
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if invitation is for current user
    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to accept this invitation' });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been processed' });
    }

    // Check if invitation has expired
    if (invitation.expiresAt < Date.now()) {
      invitation.status = 'rejected';
      await invitation.save();
      return res.status(400).json({ message: 'Invitation has expired' });
    }

    // Update invitation status
    invitation.status = 'accepted';
    await invitation.save();

    // Add user to group members
    const group = await Group.findById(invitation.group);
    group.members.push({
      user: req.user._id,
      role: 'member'
    });
    await group.save();

    // Add group to user's groups
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { groups: group._id } }
    );

    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject group invitation
// @route   PUT /api/groups/invitations/:id/reject
// @access  Private
exports.rejectInvitation = async (req, res) => {
  try {
    // Find the invitation
    const invitation = await Invitation.findById(req.params.id);

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Check if invitation is for current user
    if (invitation.invitedUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to reject this invitation' });
    }

    // Check if invitation is still pending
    if (invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Invitation has already been processed' });
    }

    // Update invitation status
    invitation.status = 'rejected';
    await invitation.save();

    res.json({ message: 'Invitation rejected successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending invitations for current user
// @route   GET /api/groups/invitations
// @access  Private
exports.getMyInvitations = async (req, res) => {
  console.log('=== getMyInvitations called ===');
  console.log('User ID:', req.user._id);
  
  try {
    console.log('Looking for invitations with user ID:', req.user._id);
    
    // Verify that Invitation model is loaded correctly
    console.log('Invitation model schema:', JSON.stringify(Invitation.schema.paths));
    
    const invitations = await Invitation.find({
      invitedUser: req.user._id,
      status: 'pending'
    })
      .populate('group', 'name description')
      .populate('invitedBy', 'username fullName');
    
    console.log('Found invitations:', invitations.length);
    console.log('Invitations data:', JSON.stringify(invitations));
    
    res.json(invitations);
  } catch (error) {
    console.error('Error in getMyInvitations:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a group
// @route   DELETE /api/groups/:id
// @access  Private (Admin only)
exports.deleteGroup = async (req, res) => {
  try {
    // Find the group
    const group = await Group.findById(req.params.id);

    if (!group) {
      return res.status(404).json({ 
        success: false,
        message: 'Grup tidak ditemukan' 
      });
    }

    // Check if user is the creator/admin of the group
    const isAdmin = group.members.some(
      member => 
        member.user.toString() === req.user._id.toString() && 
        member.role === 'admin'
    );

    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Hanya admin yang dapat menghapus grup' 
      });
    }

    console.log(`Deleting group ${group._id} by user ${req.user._id}`);

    // Delete all invitations related to this group
    await Invitation.deleteMany({ group: group._id });
    
    // Remove group from all users' groups array
    for (const member of group.members) {
      await User.findByIdAndUpdate(
        member.user,
        { $pull: { groups: group._id } }
      );
    }

    // Delete the group
    await Group.findByIdAndDelete(req.params.id);

    res.json({ 
      success: true,
      message: 'Grup berhasil dihapus' 
    });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ 
      success: false,
      message: `Gagal menghapus grup: ${error.message}` 
    });
  }
};
