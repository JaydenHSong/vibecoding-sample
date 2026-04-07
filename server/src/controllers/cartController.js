const Cart = require('../models/Cart');
const stockService = require('../services/stockService');

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product items.variant');
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
    const { product, variant, quantity = 1, selectedOption } = req.body;
    if (!product || !Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return res.status(400).json({ error: 'Invalid product or quantity' });
    }
    let cart = await Cart.findOne({ user: req.user._id });

    // Plan SC: SC-01, SC-06 — validate stock before adding to cart
    if (variant) {
      const { available, stock } = await stockService.checkAvailability(variant, quantity);
      if (!available) {
        return res.status(400).json({ error: 'Insufficient stock', available: stock });
      }
    }

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existing = cart.items.find(item =>
      item.product.toString() === product &&
      (variant ? item.variant?.toString() === variant : item.selectedOption === selectedOption)
    );

    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product, variant, quantity, selectedOption });
    }

    await cart.save();
    await cart.populate('items.product items.variant');
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
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 99) {
      return res.status(400).json({ error: 'Quantity must be 1-99' });
    }
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ error: '장바구니를 찾을 수 없습니다' });

    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ error: '상품을 찾을 수 없습니다' });

    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product items.variant');
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
    await cart.populate('items.product items.variant');
    res.json(cart);
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
