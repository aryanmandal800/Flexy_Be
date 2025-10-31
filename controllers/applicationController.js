'use strict';

const { UserProfile, Job, JobApplication } = require('../models');

exports.applyToJob = async (req, res) => {
  try {
    const userId = req.userId;
    const { jobId, coverLetter } = req.body;

    if (!jobId) {
      return res.status(400).json({ message: 'jobId is required' });
    }

    const profile = await UserProfile.findOne({ where: { userId } });
    if (!profile) {
      return res.status(400).json({ message: 'Please create job profile before applying' });
    }

    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const [application, created] = await JobApplication.findOrCreate({
      where: { userId, jobId },
      defaults: { userId, jobId, coverLetter, status: 'applied' }
    });

    if (!created) {
      return res.status(200).json({ message: 'Already applied', application });
    }

    return res.status(201).json(application);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to apply to job', error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    if (!['applied', 'review', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await JobApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const updateData = { status, notes };
    
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await application.update(updateData);

    return res.status(200).json(application);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to update application status', error: err.message });
  }
};

exports.scheduleApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { scheduledDate, scheduledTime, notes } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ message: 'scheduledDate is required' });
    }

    const application = await JobApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only allow scheduling for accepted applications
    if (application.status !== 'accepted') {
      return res.status(400).json({ message: 'Can only schedule accepted applications' });
    }

    await application.update({
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      notes
    });

    return res.status(200).json(application);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to schedule application', error: err.message });
  }
};

exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const whereClause = { userId };
    if (status) {
      whereClause.status = status;
    }

    const applications = await JobApplication.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'jobId', 'title', 'companyName', 'location', 'pricePerHour']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(applications);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to fetch applications', error: err.message });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const { status, jobId } = req.query;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (jobId) {
      whereClause.jobId = jobId;
    }

    const applications = await JobApplication.findAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'jobId', 'title', 'companyName', 'location', 'pricePerHour']
        },
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'email'],
          include: [
            {
              model: UserProfile,
              as: 'profile',
              attributes: ['firstName', 'lastName', 'phone']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(applications);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to fetch applications', error: err.message });
  }
};


