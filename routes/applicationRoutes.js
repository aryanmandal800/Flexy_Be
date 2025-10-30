'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');

// Apply to a job (requires profile)
router.post('/applyToJob', auth, applicationController.applyToJob);

// Get user's applications
router.get('/myApplications', auth, applicationController.getUserApplications);

// Update application status (for users - limited functionality)
router.patch('/:applicationId/status', auth, applicationController.updateApplicationStatus);

// Schedule application (for users - limited functionality)
router.patch('/:applicationId/schedule', auth, applicationController.scheduleApplication);

module.exports = router;


