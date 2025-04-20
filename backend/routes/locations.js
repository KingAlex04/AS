const express = require('express');
const router = express.Router();
const Location = require('../models/Location');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/locations
// @desc    Record a new location
// @access  Private/Staff
router.post('/', protect, async (req, res) => {
  try {
    const { coordinates, address, type } = req.body;
    
    // Create location
    const location = await Location.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      coordinates,
      address,
      type: type || 'tracking'
    });
    
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/locations/checkin
// @desc    Check in
// @access  Private/Staff
router.post('/checkin', protect, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    
    // Create checkin location
    const location = await Location.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      coordinates,
      address,
      type: 'checkin'
    });
    
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/locations/checkout
// @desc    Check out
// @access  Private/Staff
router.post('/checkout', protect, async (req, res) => {
  try {
    const { coordinates, address } = req.body;
    
    // Create checkout location
    const location = await Location.create({
      userId: req.user.id,
      companyId: req.user.companyId,
      coordinates,
      address,
      type: 'checkout'
    });
    
    res.status(201).json({
      success: true,
      data: location
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/locations/today
// @desc    Get today's locations for a company
// @access  Private/Admin/Company
router.get('/today', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    // Calculate start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Build query
    let query = {
      timestamp: { $gte: today, $lt: tomorrow }
    };
    
    // Filter by company for company admins
    if (req.user.role === 'company') {
      query.companyId = req.user.companyId;
    } else if (req.query.companyId) {
      // Admin can filter by company
      query.companyId = req.query.companyId;
    }
    
    // Count checkins and checkouts
    const checkins = await Location.countDocuments({ 
      ...query,
      type: 'checkin'
    });
    
    const checkouts = await Location.countDocuments({ 
      ...query,
      type: 'checkout'
    });
    
    res.json({
      success: true,
      data: {
        checkins,
        checkouts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/locations/staff/:userId
// @desc    Get locations for a specific staff member
// @access  Private/Admin/Company/Self
router.get('/staff/:userId', protect, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if authorized to view this user's locations
    if (
      req.user.role !== 'admin' && 
      (req.user.role !== 'company' || user.companyId.toString() !== req.user.companyId.toString()) &&
      req.user.id !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this user\'s locations'
      });
    }
    
    // Set up date filters if provided
    let dateFilter = {};
    if (req.query.startDate && req.query.endDate) {
      dateFilter = {
        timestamp: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        }
      };
    } else if (req.query.startDate) {
      dateFilter = {
        timestamp: { $gte: new Date(req.query.startDate) }
      };
    } else if (req.query.endDate) {
      dateFilter = {
        timestamp: { $lte: new Date(req.query.endDate) }
      };
    }
    
    // Query locations
    const locations = await Location.find({
      userId,
      ...dateFilter
    }).sort({ timestamp: -1 });
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/locations/recent
// @desc    Get recent activities
// @access  Private/Admin/Company
router.get('/recent', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Build query
    let query = {};
    
    // Filter by company for company admins
    if (req.user.role === 'company') {
      query.companyId = req.user.companyId;
    } else if (req.query.companyId) {
      // Admin can filter by company
      query.companyId = req.query.companyId;
    }
    
    // Get recent activities with user details
    const locations = await Location.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('userId', 'name email designation')
      .populate('companyId', 'name');
    
    res.json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/locations/company
// @desc    Get locations for a company
// @access  Private/Admin/Company
router.get('/company', protect, authorize('admin', 'company'), async (req, res) => {
  try {
    // Build query
    let query = {};
    
    // Filter by company
    if (req.user.role === 'company') {
      query.companyId = req.user.companyId;
    } else if (req.query.companyId) {
      // Admin must specify company
      query.companyId = req.query.companyId;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Company ID is required'
      });
    }
    
    // Set up date filters if provided
    if (req.query.startDate && req.query.endDate) {
      query.timestamp = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    } else if (req.query.startDate) {
      query.timestamp = { $gte: new Date(req.query.startDate) };
    } else if (req.query.endDate) {
      query.timestamp = { $lte: new Date(req.query.endDate) };
    }
    
    // Apply type filter if provided
    if (req.query.type) {
      query.type = req.query.type;
    }
    
    // Query locations with pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    
    const total = await Location.countDocuments(query);
    const locations = await Location.find(query)
      .skip(startIndex)
      .limit(limit)
      .sort({ timestamp: -1 })
      .populate('userId', 'name email designation');
    
    res.json({
      success: true,
      count: locations.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: locations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router; 