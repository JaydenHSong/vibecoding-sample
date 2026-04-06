const Review = require('../models/Review');
const Product = require('../models/Product');

const updateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, approved: true } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    averageRating: Math.round(avg * 10) / 10,
    reviewCount: count
  });
};

// POST /api/reviews
exports.create = async (req, res) => {
  try {
    const { product, rating, content } = req.body;
    const review = await Review.create({ user: req.user._id, product, rating, content });
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: '이미 리뷰를 작성하셨습니다' });
    }
    console.error('Review error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/reviews/product/:productId
exports.getByProduct = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { product: req.params.productId, approved: true };

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Review.countDocuments(query)
    ]);

    res.json({
      data: reviews,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// ── Admin ──

// GET /api/admin/reviews
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const query = {};
    if (approved !== undefined) query.approved = approved === 'true';

    const [reviews, total] = await Promise.all([
      Review.find(query)
        .populate('user', 'name email')
        .populate('product', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Review.countDocuments(query)
    ]);

    res.json({
      data: reviews,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/reviews/:id/approve
exports.approve = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없습니다' });
    await updateProductRating(review.product);
    res.json(review);
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/admin/reviews/:id
exports.remove = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: '리뷰를 찾을 수 없습니다' });
    await updateProductRating(review.product);
    res.json({ message: '리뷰가 삭제되었습니다' });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
