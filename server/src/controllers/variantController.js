// Design Ref: §4.3 — Admin Variant API handler
const variantService = require('../services/variantService');
const Variant = require('../models/Variant');

// GET /api/products/:productId/variants
exports.getByProduct = async (req, res) => {
  try {
    const variants = await variantService.getByProduct(req.params.productId);
    res.json({ data: variants });
  } catch (error) {
    console.error('Variant error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// POST /api/admin/products/:id/variants (bulkUpsert)
exports.bulkUpsert = async (req, res) => {
  try {
    const { variants } = req.body;
    if (!Array.isArray(variants)) {
      return res.status(400).json({ error: 'variants array is required' });
    }
    const results = await variantService.bulkUpsert(req.params.id, variants);
    res.json({ data: results });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    console.error('Variant error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/variants/:id
exports.update = async (req, res) => {
  try {
    const { sku, price, stock } = req.body;
    const variant = await Variant.findByIdAndUpdate(
      req.params.id,
      { ...(sku && { sku }), ...(price != null && { price }), ...(stock != null && { stock }) },
      { new: true }
    );
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    await variantService.syncProductAggregates(variant.product);
    res.json(variant);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    console.error('Variant error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/admin/variants/:id (soft delete)
exports.remove = async (req, res) => {
  try {
    const variant = await Variant.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    await variantService.syncProductAggregates(variant.product);
    res.json({ message: 'Variant deactivated' });
  } catch (error) {
    console.error('Variant error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
