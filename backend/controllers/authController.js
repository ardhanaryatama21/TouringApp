const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { validationResult } = require('express-validator');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: 'Validasi gagal. Pastikan semua field diisi dengan benar.'
    });
  }

  const { username, email, password, fullName } = req.body;
  
  // Log request untuk debugging
  console.log('Register request received:', { username, email, fullName });

  try {
    // Check if user already exists with same email
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      console.log('Email already exists:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Email sudah digunakan. Silakan gunakan email lain.'
      });
    }
    
    // Check if user already exists with same username
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.log('Username already exists:', username);
      return res.status(400).json({ 
        success: false,
        message: 'Username sudah digunakan. Silakan pilih username lain.'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName
    });

    if (user) {
      console.log('User created successfully:', user._id);
      res.status(201).json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        token: generateToken(user._id)
      });
    } else {
      console.log('Failed to create user with valid data');
      res.status(400).json({ 
        success: false,
        message: 'Data tidak valid. Silakan periksa kembali data Anda.'
      });
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field === 'email' ? 'Email' : 'Username'} sudah digunakan.`
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi nanti.'
    });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Login validation errors:', errors.array());
    return res.status(400).json({ 
      success: false,
      errors: errors.array(),
      message: 'Validasi gagal. Pastikan semua field diisi dengan benar.'
    });
  }

  const { username, password } = req.body;
  console.log('Login attempt for username:', username);

  try {
    // Find user by username (case insensitive)
    const user = await User.findOne({ 
      username: { $regex: new RegExp('^' + username + '$', 'i') } 
    });

    if (!user) {
      console.log('User not found:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Username tidak ditemukan'
      });
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Password incorrect for user:', username);
      return res.status(401).json({ 
        success: false,
        message: 'Password salah'
      });
    }
    
    console.log('Login successful for user:', username);
    res.json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Error in loginUser:', error);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi nanti.'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    console.log('Getting profile for user ID:', req.user._id);
    const user = await User.findById(req.user._id).select('-password');

    if (user) {
      console.log('User profile found');
      res.json({
        success: true,
        _id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        groups: user.groups
      });
    } else {
      console.log('User profile not found for ID:', req.user._id);
      res.status(404).json({ 
        success: false,
        message: 'Profil pengguna tidak ditemukan' 
      });
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    res.status(500).json({ 
      success: false,
      message: 'Terjadi kesalahan server. Silakan coba lagi nanti.' 
    });
  }
};
