const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');


router.post('/signup', adminController.adminSignup);
router.post('/login', adminController.adminLogin);
router.get('/profile', adminAuth, adminController.getAdminProfile);
router.patch('/profile', adminAuth, adminController.updateAdminProfile);


router.get('/applications', adminAuth, adminController.getAllApplications);
router.patch('/applications/:applicationId/status', adminAuth, adminController.updateApplicationStatus);
router.patch('/applications/:applicationId/schedule', adminAuth, adminController.scheduleApplication);
router.get('/applications/stats', adminAuth, adminController.getApplicationStats);
router.get('/users', adminAuth, adminController.getAllUsers);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

// Dashboard counts (users, vendors, jobs)
router.get('/dashboard/counts', adminAuth, adminController.getDashboardCounts);

module.exports = router;
