'use strict';

const { UserProfile } = require('../models');

exports.createOrUpdateProfile = async (req, res) => {
  console.log('createOrUpdateProfile called');
  try {
    const userId = req.userId;
    const payload = req.body || {};
    console.log('createOrUpdateProfile called with:', { userId, payload });

    const [profile, created] = await UserProfile.findOrCreate({
      where: { userId },
      defaults: { ...payload, userId }
    });

    if (!created) {
      await profile.update(payload);
    }

    return res.status(created ? 201 : 200).json(profile);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to upsert profile', error: err.message });
  }
};


exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const profile = await UserProfile.findOne({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    return res.status(200).json(profile);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to fetch profile', error: err.message });
  }
};

