const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: '인증 토큰이 필요합니다' });
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: '토큰이 만료되었거나 유효하지 않습니다' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '관리자 권한이 필요합니다' });
  }
  next();
};

module.exports = { auth, adminOnly };
