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


exports.completeApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    await application.update({ status: 'completed', completedAt: new Date() });

    return res.status(200).json(application);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to complete application', error: err.message });
  }
};

exports.getCompletedApplicationCost = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'pricePerHour', 'shiftTime']
        }
      ]
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.status !== 'completed') {
      return res.status(400).json({ message: 'Application is not completed' });
    }

    const pricePerHour = parseFloat(application.job.pricePerHour) || 0;
    const shiftTime = application.job.shiftTime || '';

    let hours = 8;
    const timeRangeMatch = shiftTime.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
    if (timeRangeMatch) {
      const [, startHour, startMin, endHour, endMin] = timeRangeMatch;
      const startTime = parseInt(startHour) + (parseInt(startMin) / 60);
      const endTime = parseInt(endHour) + (parseInt(endMin) / 60);
      hours = endTime - startTime;
    } else {
      const hoursMatch = shiftTime.match(/(\d+(?:\.\d+)?)\s*(?:hours?|h)/i);
      if (hoursMatch) {
        hours = parseFloat(hoursMatch[1]);
      }
    }

    const cost = Math.round(pricePerHour * hours * 100) / 100;

    return res.status(200).json({
      applicationId: application.id,
      jobId: application.job.id,
      pricePerHour: Math.round(pricePerHour * 100) / 100,
      hours: Math.round(hours * 100) / 100,
      cost,
      currency: 'USD',
      completedAt: application.completedAt
    });
  } catch (err) {
    return res.status(400).json({ message: 'Failed to fetch completed application cost', error: err.message });
  }
};


