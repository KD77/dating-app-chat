const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Get the JWT token from the request header
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided' });
  }

  try {
    // Verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user information to the req object
    req.user = { id: decodedToken._id }; // Use 'sub' for the user ID

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
};

module.exports = auth;