'use strict';

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userProfileController = require('../controllers/userProfileController');


router.post('/createProfile', auth, userProfileController.createOrUpdateProfile);


router.get('/me', auth, userProfileController.getMyProfile);

module.exports = router;


