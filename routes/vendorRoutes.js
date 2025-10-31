'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const vendorController = require('../controllers/vendorController');


router.get('/', auth, vendorController.listVendors);


router.post('/', adminAuth, vendorController.createVendor);


router.delete('/:id', adminAuth, vendorController.deleteVendor);

module.exports = router;


