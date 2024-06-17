const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('Invalid token');
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err);
    throw new Error('Authentication failed');
  }
};

module.exports = { requireAuth };
