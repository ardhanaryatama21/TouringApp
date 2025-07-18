const Group = require('../models/group');
const { generateRtcToken } = require('../config/agora');

// @desc    Generate Agora RTC token for group call
// @route   GET /api/calls/:groupId/token
// @access  Private
exports.generateToken = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is a member of the group
    const isMember = group.members.some(
      member => member.user.toString() === req.user._id.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to join this group call' });
    }
    
    // Generate a token with the group ID as the channel name and user ID as the UID
    const uid = parseInt(req.user._id.toString().substring(0, 8), 16);
    const channelName = `group_${groupId}`;
    const token = generateRtcToken(channelName, uid);
    
    res.json({
      token,
      uid,
      channelName,
      appId: process.env.AGORA_APP_ID
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    End a group call (update call status)
// @route   PUT /api/calls/:groupId/end
// @access  Private (Group Creator only)
exports.endCall = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is the group creator
    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only group creator can end the call' });
    }
    
    // Here you would implement any logic needed to end the call
    // For example, you might update a call status in the database
    // or send a notification to other users that the call has ended
    
    // For now, we'll just return a success message
    // In a real implementation, you might want to use Socket.io to notify other users
    
    res.json({ message: 'Call ended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
