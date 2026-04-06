const FAQ = require('../models/FAQ');

// GET /api/faq
exports.getAll = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) query.category = category;

    const faqs = await FAQ.find(query).sort({ order: 1 });
    res.json(faqs);
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// ── Admin ──

// POST /api/admin/faq
exports.create = async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.status(201).json(faq);
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/faq/:id
exports.update = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!faq) return res.status(404).json({ error: 'FAQ를 찾을 수 없습니다' });
    res.json(faq);
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/admin/faq/:id
exports.remove = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndDelete(req.params.id);
    if (!faq) return res.status(404).json({ error: 'FAQ를 찾을 수 없습니다' });
    res.json({ message: 'FAQ가 삭제되었습니다' });
  } catch (error) {
    console.error('FAQ error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
