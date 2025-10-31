'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const applicationController = require('../controllers/applicationController');


router.post('/applyToJob', auth, applicationController.applyToJob);


router.get('/myApplications', auth, applicationController.getUserApplications);


router.patch('/:applicationId/status', auth, applicationController.updateApplicationStatus);


router.patch('/:applicationId/schedule', auth, applicationController.scheduleApplication);

module.exports = router;


