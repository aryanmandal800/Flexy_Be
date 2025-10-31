'use strict';

const { Job, JobApplication } = require('../models');

exports.createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      pricePerHour,
      shiftTime,
      shiftDay,
      companyName,
      location,
      responsibilities,
      requirements,
      requiredSkills,
      skills,
      dressCode,
      googleMapUrl
    } = req.body;

    const job = await Job.create({
      title,
      description,
      imageUrl,
      pricePerHour,
      shiftTime,
      shiftDay,
      companyName,
      location,
      responsibilities,
      requirements,
      requiredSkills,
      skills,
      dressCode,
      googleMapUrl,
      vendorId: req.userId || null
    });

    return res.status(201).json(job);
  } catch (err) {
    return res.status(400).json({ message: 'Failed to create job', error: err.message });
  }
};

exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll({ order: [['id', 'ASC']] });
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch jobs', error: err.message });
  }
};

exports.getVendorJobs = async (req, res) => {
  try {
    const vendorId = req.userId;
    const jobs = await Job.findAll({ where: { vendorId }, order: [['createdAt', 'DESC']] });
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch vendor jobs', error: err.message });
  }
};

exports.getJobsByApplicationStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    if (!status) {
      return res.status(400).json({ message: 'status query parameter is required' });
    }

    if (!['applied', 'review', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: applied, review, accepted, rejected, completed' });
    }

    const applications = await JobApplication.findAll({
      where: { userId, status },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: [
            'id', 'jobId', 'title', 'description', 'imageUrl', 'pricePerHour',
            'shiftTime', 'shiftDay', 'location', 'companyName', 'responsibilities',
            'requirements', 'requiredSkills', 'skills', 'dressCode', 'googleMapUrl',
            'createdAt', 'updatedAt'
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Extract jobs from applications
    const jobs = applications.map(app => ({
      ...app.job.toJSON(),
      applicationStatus: app.status,
      applicationId: app.id,
      appliedAt: app.createdAt,
      scheduledDate: app.scheduledDate,
      scheduledTime: app.scheduledTime,
      completedAt: app.completedAt,
      notes: app.notes
    }));

    return res.status(200).json({
      jobs,
      count: jobs.length,
      status
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch jobs by status', error: err.message });
  }
};

exports.getUserEarnings = async (req, res) => {
  try {
    const userId = req.userId;

   
    const completedApplications = await JobApplication.findAll({
      where: { userId, status: 'completed' },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'pricePerHour', 'shiftTime', 'companyName']
        }
      ]
    });

  
    let totalEarnings = 0;
    const earningsBreakdown = completedApplications.map(app => {
      const job = app.job;
      const pricePerHour = parseFloat(job.pricePerHour) || 0;
      
   
      const shiftTime = job.shiftTime || '';
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
      
      const jobEarnings = pricePerHour * hours;
      totalEarnings += jobEarnings;

      return {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.companyName,
        pricePerHour: pricePerHour,
        hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
        earnings: Math.round(jobEarnings * 100) / 100, // Round to 2 decimal places
        shiftTime: shiftTime,
        completedAt: app.completedAt
      };
    });

    return res.status(200).json({
      totalEarnings: Math.round(totalEarnings * 100) / 100, // Round to 2 decimal places
      completedJobs: completedApplications.length,
      earningsBreakdown,
      currency: 'USD' // You can make this configurable
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to calculate earnings', error: err.message });
  }
};

exports.getUserActiveJobs = async (req, res) => {
  try {
    const userId = req.userId;

    // Get active applications (applied, review, accepted, scheduled)
    const activeApplications = await JobApplication.findAll({
      where: { 
        userId, 
        status: ['applied', 'review', 'accepted'] 
      },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'companyName', 'location', 'pricePerHour', 'shiftTime']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Count by status
    const statusCounts = {
      applied: 0,
      review: 0,
      accepted: 0,
      total: activeApplications.length
    };

    activeApplications.forEach(app => {
      statusCounts[app.status]++;
    });

    return res.status(200).json({
      activeJobs: activeApplications.map(app => ({
        applicationId: app.id,
        jobId: app.job.id,
        jobTitle: app.job.title,
        companyName: app.job.companyName,
        location: app.job.location,
        pricePerHour: app.job.pricePerHour,
        shiftTime: app.job.shiftTime,
        status: app.status,
        appliedAt: app.createdAt,
        scheduledDate: app.scheduledDate,
        scheduledTime: app.scheduledTime
      })),
      statusCounts,
      totalActiveJobs: activeApplications.length
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch active jobs', error: err.message });
  }
};

exports.getUserDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all applications for the user
    const allApplications = await JobApplication.findAll({
      where: { userId },
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'title', 'pricePerHour', 'shiftTime', 'companyName']
        }
      ]
    });

    // Calculate earnings from completed jobs
    const completedApplications = allApplications.filter(app => app.status === 'completed');
    let totalEarnings = 0;
    
    completedApplications.forEach(app => {
      const pricePerHour = parseFloat(app.job.pricePerHour) || 0;
      const shiftTime = app.job.shiftTime || '';
      
      // Extract hours from shiftTime - handle time range format like "09:00-11:00"
      let hours = 8; // Default to 8 hours if not specified
      
      // Check if shiftTime is in time range format (HH:MM-HH:MM)
      const timeRangeMatch = shiftTime.match(/(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/);
      if (timeRangeMatch) {
        const [, startHour, startMin, endHour, endMin] = timeRangeMatch;
        const startTime = parseInt(startHour) + (parseInt(startMin) / 60);
        const endTime = parseInt(endHour) + (parseInt(endMin) / 60);
        hours = endTime - startTime;
      } else {
        // Fallback to text format like "8 hours" or "8h"
        const hoursMatch = shiftTime.match(/(\d+(?:\.\d+)?)\s*(?:hours?|h)/i);
        if (hoursMatch) {
          hours = parseFloat(hoursMatch[1]);
        }
      }
      
      totalEarnings += pricePerHour * hours;
    });

    // Count applications by status
    const statusCounts = {
      applied: 0,
      review: 0,
      accepted: 0,
      rejected: 0,
      completed: 0
    };

    allApplications.forEach(app => {
      statusCounts[app.status]++;
    });

    // Count active jobs (non-completed, non-rejected)
    const activeJobs = allApplications.filter(app => 
      !['completed', 'rejected'].includes(app.status)
    ).length;

    return res.status(200).json({
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalApplications: allApplications.length,
      activeJobs,
      completedJobs: statusCounts.completed,
      statusBreakdown: statusCounts,
      currency: 'USD'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch dashboard stats', error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Job ID required' });
    }
    const job = await Job.findByPk(id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    // Delete related JobApplications explicitly (for clarity, associations have CASCADE but some DBs require manual cleanup)
    await JobApplication.destroy({ where: { jobId: id } });
    await job.destroy();
    return res.status(204).send();
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete job', error: err.message });
  }
};


exports.getJobHourlyCost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Job ID required' });
    }

    const job = await Job.findByPk(id, { attributes: ['id', 'title', 'companyName', 'pricePerHour'] });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    return res.status(200).json({
      jobId: job.id,
      jobTitle: job.title,
      companyName: job.companyName,
      pricePerHour: job.pricePerHour,
      currency: 'USD'
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch hourly cost', error: err.message });
  }
};

