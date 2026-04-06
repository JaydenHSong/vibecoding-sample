const Inquiry = require('../models/Inquiry');

// POST /api/inquiries
exports.create = async (req, res) => {
  try {
    const { title, content } = req.body;
    const inquiry = await Inquiry.create({ user: req.user._id, title, content });
    res.status(201).json(inquiry);
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/inquiries (내 문의 목록)
exports.getMine = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// ── Admin ──

// GET /api/admin/inquiries
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, answered } = req.query;
    const query = {};
    if (answered === 'true') query.answer = { $ne: null };
    if (answered === 'false') query.answer = null;

    const [inquiries, total] = await Promise.all([
      Inquiry.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Inquiry.countDocuments(query)
    ]);

    res.json({
      data: inquiries,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/inquiries/:id/answer
exports.answer = async (req, res) => {
  try {
    const { answer } = req.body;
    const inquiry = await Inquiry.findByIdAndUpdate(
      req.params.id,
      { answer, answeredAt: new Date() },
      { new: true }
    );
    if (!inquiry) return res.status(404).json({ error: '문의를 찾을 수 없습니다' });
    res.json(inquiry);
  } catch (error) {
    console.error('Inquiry error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
