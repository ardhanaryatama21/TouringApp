const User = require('../models/user');

// @desc    Search users by username, email, or full name
// @route   GET /api/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Search for users by username, email, or full name
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { fullName: { $regex: query, $options: 'i' } }
      ]
    })
      .select('username email fullName profilePicture')
      .limit(10);
    
    // Don't include the current user in search results
    const filteredUsers = users.filter(
      user => user._id.toString() !== req.user._id.toString()
    );
    
    res.json(filteredUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
