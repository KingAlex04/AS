const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users
// @desc    Get all users (filtered by company for company admins)
// @access  Private/Admin/Company
router.get('/', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    let users;
    
    // Admin can see all users, company admin only sees their company users
    if (req.user.role === 'admin') {
      users = await User.find().select('-password');
    } else {
      users = await User.find({ companyId: req.user.companyId }).select('-password');
    }
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/staff
// @desc    Get all staff users (for company admins)
// @access  Private/Company
router.get('/staff', protect, authorize('company'), async (req, res) => {
  try {
    const users = await User.find({ 
      companyId: req.user.companyId,
      role: 'staff'
    }).select('-password');
    
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/active
// @desc    Get count of active users
// @access  Private/Admin/Company
router.get('/active', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    let query = { active: true };
    
    // Filter by company for company admins
    if (req.user.role === 'company') {
      query.companyId = req.user.companyId;
    }
    
    // Count active staff
    const staffCount = await User.countDocuments({ 
      ...query, 
      role: 'staff' 
    });
    
    // Count active companies
    const companyCount = await User.countDocuments({ 
      ...query, 
      role: 'company' 
    });
    
    res.json({
      success: true,
      data: {
        activeStaff: staffCount,
        activeCompany: companyCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private/Admin/Company
router.get('/:id', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if company admin is trying to access user from different company
    if (req.user.role === 'company' && user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this user'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private/Admin/Company/Self
router.put('/:id', protect, async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user is authorized to update
    // User can update their own profile, admin can update any profile, 
    // company admin can update profiles in their company
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'company' || user.companyId.toString() !== req.user.companyId.toString()) &&
      req.user.id !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }
    
    // Don't allow role changes except for admin
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }
    
    // Don't update password here - use separate endpoint
    if (req.body.password) {
      delete req.body.password;
    }
    
    // Update user
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Private/Admin/Company
router.delete('/:id', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if company admin is trying to delete user from different company
    if (req.user.role === 'company' && user.companyId.toString() !== req.user.companyId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }
    
    // Don't allow company admins to delete other company admins
    if (req.user.role === 'company' && user.role === 'company') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete company admin'
      });
    }
    
    await user.remove();
    
    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 