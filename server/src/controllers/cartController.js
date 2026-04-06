const Cart = require('../models/Cart');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    if (!cart) cart = { user: req.user._id, items: [] };
    res.json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// POST /api/cart
exports.addItem = async (req, res) => {
  try {
    const { product, quantity = 1, selectedOption } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(
      item => item.product.toString() === product && item.selectedOption === selectedOption
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product, quantity, selectedOption });
    }

    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/cart/:itemId
exports.updateItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: '상품을 찾을 수 없습니다' });

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// DELETE /api/cart/:itemId
exports.removeItem = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });

    cart.items.pull(req.params.itemId);
    await cart.save();
    await cart.populate('items.product');
    res.json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
