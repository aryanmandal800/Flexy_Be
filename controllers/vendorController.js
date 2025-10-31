'use strict';

const { Vendor } = require('../models');
const bcrypt = require('bcrypt');

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
      return res.status(400).json({ message: 'name, email and password are required' });
    }
    const vendor = await Vendor.create({ name, email, contact, address, company,password });
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


