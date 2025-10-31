'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, JobApplication, Job, User, UserProfile } = require('../models');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

function sanitizeAdmin(adminInstance) {
  const { id, name, email, phone, isActive, createdAt, updatedAt } = adminInstance;
  return { id, name, email, phone, isActive, createdAt, updatedAt };
}

exports.adminSignup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'name, email, phone, and password are required' });
    }

    const existing = await Admin.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const existingPhone = await Admin.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(409).json({ message: 'Phone already in use' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = await Admin.create({ name, email, phone, passwordHash });

    const token = jwt.sign({ sub: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(201).json({ admin: sanitizeAdmin(admin), token });
  } catch (err) {
    console.error('Admin signup error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const admin = await Admin.findOne({ where: { email, isActive: true } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: admin.id, role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({ admin: sanitizeAdmin(admin), token });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await Admin.findByPk(adminId, {
      attributes: ['id', 'name', 'email', 'phone', 'isActive', 'createdAt', 'updatedAt']
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    return res.json(admin);
  } catch (err) {
    console.error('Get admin profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'phone', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      users,
      totalUsers: count,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Get all users error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllApplications = async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    if (jobId) {
      whereClause.jobId = jobId;
    }

    const { count, rows: applications } = await JobApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'jobId', 'title', 'companyName', 'location', 'pricePerHour']
        },
        {
          model: User,
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
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      applications,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('Get all applications error:', err);
    return res.status(500).json({ message: 'Internal server error' });
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
    
    // Set completedAt when status is changed to completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await application.update(updateData);

    // Return updated application with relations
    const updatedApplication = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'jobId', 'title', 'companyName', 'location', 'pricePerHour']
        },
        {
          model: User,
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
      ]
    });

    return res.json(updatedApplication);
  } catch (err) {
    console.error('Update application status error:', err);
    return res.status(500).json({ message: 'Internal server error' });
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

 
    const updatedApplication = await JobApplication.findByPk(applicationId, {
      include: [
        {
          model: Job,
          as: 'job',
          attributes: ['id', 'jobId', 'title', 'companyName', 'location', 'pricePerHour']
        },
        {
          model: User,
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
      ]
    });

    return res.json(updatedApplication);
  } catch (err) {
    console.error('Schedule application error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getApplicationStats = async (req, res) => {
  try {
    const stats = await JobApplication.findAll({
      attributes: [
        'status',
        [JobApplication.sequelize.fn('COUNT', JobApplication.sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    const totalApplications = await JobApplication.count();
    const scheduledApplications = await JobApplication.count({
      where: {
        scheduledDate: {
          [JobApplication.sequelize.Op.ne]: null
        }
      }
    });

    const completedApplications = await JobApplication.count({
      where: { status: 'completed' }
    });

    return res.json({
      statusBreakdown: stats,
      totalApplications,
      scheduledApplications,
      completedApplications
    });
  } catch (err) {
    console.error('Get application stats error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
