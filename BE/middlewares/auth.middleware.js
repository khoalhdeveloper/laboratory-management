
const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
 
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
     req.user.userid = decoded.userid;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};


exports.optionalVerifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  
  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    req.user.userid = decoded.userid;
    next();
  } catch (err) {
   
    next();
  }
};

exports.authorizeRole = (roles = []) => {
  
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};


