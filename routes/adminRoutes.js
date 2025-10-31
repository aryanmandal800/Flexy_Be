const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');


router.post('/signup', adminController.adminSignup);
router.post('/login', adminController.adminLogin);
router.get('/profile', adminAuth, adminController.getAdminProfile);


router.get('/applications', adminAuth, adminController.getAllApplications);
router.patch('/applications/:applicationId/status', adminAuth, adminController.updateApplicationStatus);
router.patch('/applications/:applicationId/schedule', adminAuth, adminController.scheduleApplication);
router.get('/applications/stats', adminAuth, adminController.getApplicationStats);
router.get('/getAllUsers', adminAuth, adminController.getAllUsers);

module.exports = router;
