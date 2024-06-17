const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Authorization token invalid' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authorization token invalid' });
  }
};

module.exports = authMiddleware;
