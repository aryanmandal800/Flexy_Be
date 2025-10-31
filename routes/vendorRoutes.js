'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const vendorAuth = require('../middleware/vendorAuth');
const vendorController = require('../controllers/vendorController');
const jobController = require('../controllers/jobController');


router.get('/', auth, vendorController.listVendors);


router.post('/login', vendorController.vendorLogin);

router.get('/me', vendorAuth, vendorController.getProfile);


router.get('/jobs', vendorAuth, jobController.getVendorJobs);

router.post('/', adminAuth, vendorController.createVendor);


router.delete('/:id', adminAuth, vendorController.deleteVendor);

module.exports = router;


