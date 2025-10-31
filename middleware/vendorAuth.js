'use strict';

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'change_me_in_env';

module.exports = function vendorAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    if (payload.role !== 'vendor') {
      return res.status(403).json({ message: 'Vendor access required' });
    }

    req.userId = payload.sub;
    req.userRole = payload.role;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
