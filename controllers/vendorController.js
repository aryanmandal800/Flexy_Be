'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Vendor } = require('../models');

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_env';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function sanitizeVendor(vendorInstance) {
  const { id, name, email, contact, address, company, createdAt, updatedAt } = vendorInstance;
  return { id, name, email, contact, address, company, createdAt, updatedAt };
}

exports.listVendors = async (req, res) => {
  try {
    const vendors = await Vendor.findAll({ order: [['id', 'ASC']] });
    return res.json(vendors);
  } catch (err) {
    console.error('Error listing vendors', err);
    return res.status(500).json({ message: 'Failed to fetch vendors' });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { name, email, contact, address, company, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name and email are required' });
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const vendor = await Vendor.create({ name, email, contact, address, company, passwordHash });
    return res.status(201).json(vendor);
  } catch (err) {
    console.error('Error creating vendor', err);
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Vendor with this email already exists' });
    }
    return res.status(500).json({ message: 'Failed to create vendor' });
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCount = await Vendor.destroy({ where: { id } });
    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    return res.status(204).send();
  } catch (err) {
    console.error('Error deleting vendor', err);
    return res.status(500).json({ message: 'Failed to delete vendor' });
  }
};

exports.vendorLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const vendor = await Vendor.findOne({ where: { email } });
    if (!vendor || !vendor.passwordHash) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, vendor.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ sub: vendor.id, role: 'vendor' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    return res.json({ vendor: sanitizeVendor(vendor), token });
  } catch (err) {
    console.error('Vendor login error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const vendorId = req.userId;
    const vendor = await Vendor.findByPk(vendorId, {
      attributes: ['id', 'name', 'email', 'contact', 'address', 'company', 'createdAt', 'updatedAt']
    });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    return res.json(sanitizeVendor(vendor));
  } catch (err) {
    console.error('Get vendor profile error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


