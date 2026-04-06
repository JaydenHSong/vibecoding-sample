const Banner = require('../models/Banner');

// GET /api/banners (활성 배너만)
exports.getActive = async (req, res) => {
  try {
    const { position } = req.query;
    const query = { isActive: true };
    if (position) query.position = position;

    const banners = await Banner.find(query).sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Banner error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// ── Admin ──

// GET /api/admin/banners
exports.getAll = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (error) {
    console.error('Banner error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// POST /api/admin/banners
exports.create = async (req, res) => {
  try {
    const banner = await Banner.create(req.body);
    res.status(201).json(banner);
  } catch (error) {
    console.error('Banner error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/banners/:id
exports.update = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!banner) return res.status(404).json({ error: '배너를 찾을 수 없습니다' });
    res.json(banner);
  } catch (error) {
    console.error('Banner error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/admin/banners/:id
exports.remove = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ error: '배너를 찾을 수 없습니다' });
    res.json({ message: '배너가 삭제되었습니다' });
  } catch (error) {
    console.error('Banner error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
