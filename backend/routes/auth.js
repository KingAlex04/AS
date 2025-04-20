const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const { protect, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'mysecretkey', {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register a user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, companyId, phoneNumber, designation } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'staff',
      companyId,
      phoneNumber,
      designation
    });

    // Return response with token
    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        designation: user.designation,
        companyId: user.companyId
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/register-company
// @desc    Register a company with admin user
// @access  Public
router.post('/register-company', async (req, res) => {
  try {
    const { companyName, address, email, phoneNumber, adminName, adminEmail, adminPassword } = req.body;

    // Check if admin user already exists
    const userExists = await User.findOne({ email: adminEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    // Create admin user first
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'company',
      phoneNumber
    });

    // Create company
    const company = await Company.create({
      name: companyName,
      address,
      email,
      phoneNumber,
      owner: adminUser._id
    });

    // Update admin user with company ID
    adminUser.companyId = company._id;
    await adminUser.save();

    // Return response with token
    res.status(201).json({
      success: true,
      token: generateToken(adminUser._id),
      user: {
        _id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        companyId: company._id
      },
      company: {
        _id: company._id,
        name: company.name,
        address: company.address,
        email: company.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`Login attempt for email: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).catch(err => {
      console.error('Error finding user:', err);
      return null;
    });

    // Special case for admin login with default credentials
    if (email === 'laxmisah988@gmail.com' && user) {
      console.log('Admin login attempt detected');
      
      // Verify password directly for admin
      const isMatch = await user.comparePassword(password).catch(err => {
        console.error('Error comparing admin password:', err);
        return false;
      });

      if (isMatch) {
        console.log('Admin login successful');
        
        // Ensure admin role is set
        if (user.role !== 'admin') {
          user.role = 'admin';
          await user.save();
          console.log('Updated user role to admin');
        }
        
        // Generate token and return success
        const token = generateToken(user._id);
        
        return res.json({
          success: true,
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phoneNumber: user.phoneNumber,
            designation: user.designation,
            companyId: user.companyId,
            profilePicture: user.profilePicture
          }
        });
      }
    }

    if (!user) {
      console.log(`User not found with email: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`User found: ${user.name}, role: ${user.role}`);

    // Check if user is active
    if (!user.active) {
      console.log(`User account is deactivated: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact an administrator.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password).catch(err => {
      console.error('Error comparing password:', err);
      return false;
    });

    if (!isMatch) {
      console.log(`Invalid password for user: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log(`Login successful for: ${email}`);

    // Generate token
    const token = generateToken(user._id);

    // Return response with token
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        designation: user.designation,
        companyId: user.companyId,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 