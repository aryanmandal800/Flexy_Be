'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const vendorController = require('../controllers/vendorController');

// List vendors (authenticated users)
router.get('/', auth, vendorController.listVendors);

// Create vendor (admin only)
router.post('/', adminAuth, vendorController.createVendor);

// Delete vendor (admin only)
router.delete('/:id', adminAuth, vendorController.deleteVendor);

module.exports = router;


