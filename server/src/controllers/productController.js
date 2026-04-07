const Product = require('../models/Product');
const Variant = require('../models/Variant');
const variantService = require('../services/variantService');

// GET /api/products
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, sort, minPrice, maxPrice } = req.query;
    const query = {};

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'popular') sortOption = { reviewCount: -1 };
    if (sort === 'rating') sortOption = { averageRating: -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/products/:id
exports.getById = async (req, res) => {
  try {
    const [product, variants] = await Promise.all([
      Product.findById(req.params.id).populate('category', 'name slug'),
      Variant.find({ product: req.params.id, isActive: true }).sort({ createdAt: 1 })
    ]);
    if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    const productObj = product.toObject();
    productObj.variants = variants;
    res.json(productObj);
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/search
exports.search = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ error: '검색어를 입력해주세요' });

    const query = {
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      data: products,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

const ALLOWED_PRODUCT_FIELDS = ['name', 'price', 'description', 'features', 'images', 'category', 'options', 'stock', 'isBestSeller', 'isNew'];

const pickFields = (body, fields) => {
  const picked = {};
  for (const key of fields) {
    if (body[key] !== undefined) picked[key] = body[key];
  }
  return picked;
};

// POST /api/admin/products
exports.create = async (req, res) => {
  try {
    const product = await Product.create(pickFields(req.body, ALLOWED_PRODUCT_FIELDS));
    // Auto-create variants if provided
    if (req.body.variants?.length) {
      await variantService.bulkUpsert(product._id, req.body.variants);
    }
    res.status(201).json(product);
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/products/:id
exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pickFields(req.body, ALLOWED_PRODUCT_FIELDS), { new: true });
    if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    res.json(product);
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/admin/products/:id
exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: '상품을 찾을 수 없습니다' });
    res.json({ message: '상품이 삭제되었습니다' });
  } catch (error) {
    console.error('Product error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
