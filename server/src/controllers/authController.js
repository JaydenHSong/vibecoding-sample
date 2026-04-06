const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, name, phone, gender } = req.body;

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '유효한 이메일 주소를 입력해주세요' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ error: '비밀번호는 8자 이상이어야 합니다' });
    }
    if (!name || name.trim().length < 1) {
      return res.status(400).json({ error: '이름을 입력해주세요' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ error: '이미 등록된 이메일입니다' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email, password: hashed, name, phone, gender
    });

    res.status(201).json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
    }

    res.json({
      user: { id: user._id, email: user.email, name: user.name, role: user.role },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
