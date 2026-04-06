const Category = require('../models/Category');

// GET /api/categories
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent', 'name slug');
    res.json(categories);
  } catch (error) {
    console.error('Category error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/categories/:id
exports.getById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name slug');
    if (!category) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다' });
    res.json(category);
  } catch (error) {
    console.error('Category error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// POST /api/admin/categories
exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Category error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/categories/:id
exports.update = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다' });
    res.json(category);
  } catch (error) {
    console.error('Category error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/admin/categories/:id
exports.remove = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ error: '카테고리를 찾을 수 없습니다' });
    res.json({ message: '카테고리가 삭제되었습니다' });
  } catch (error) {
    console.error('Category error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
