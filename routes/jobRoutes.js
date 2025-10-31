'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const vendorAuth = require('../middleware/vendorAuth');
const jobController = require('../controllers/jobController');

router.post('/', vendorAuth, jobController.createJob);

router.get('/getAllJobs', jobController.getAllJobs);

router.get('/myJobs', auth, jobController.getJobsByApplicationStatus);

router.get('/myEarnings', auth, jobController.getUserEarnings);


router.get('/myActiveJobs', auth, jobController.getUserActiveJobs);


router.get('/myDashboard', auth, jobController.getUserDashboardStats);

router.delete('/:id', adminAuth, jobController.deleteJob);

module.exports = router;


