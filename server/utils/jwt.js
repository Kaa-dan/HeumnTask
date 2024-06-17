const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      role: user.role,
      organizationId: user.organizationId,
    },
    'your_jwt_secret',
    { expiresIn: '1d' }
  );
};

module.exports = { generateToken };
