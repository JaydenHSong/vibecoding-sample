const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const stockService = require('../services/stockService');

const crypto = require('crypto');

const generateOrderNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = crypto.randomBytes(6).toString('hex').toUpperCase();
  return `ORD-${date}-${rand}`;
};

// POST /api/orders
exports.create = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod, paymentIntentId } = req.body;
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product items.variant');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: '장바구니가 비어있습니다' });
    }

    // Plan SC: SC-01 — use variant price, snapshot variant info
    const items = cart.items.map(item => {
      const variant = item.variant;
      return {
        product: item.product._id,
        variant: variant?._id,
        name: item.product.name,
        price: variant ? variant.price : item.product.price,
        quantity: item.quantity,
        sku: variant?.sku,
        variantOptions: variant?.options ? Object.fromEntries(variant.options) : undefined,
        selectedOption: item.selectedOption
      };
    });

    // Plan SC: SC-06 — atomic stock decrement via transaction
    const variantItems = items.filter(i => i.variant).map(i => ({
      variantId: i.variant,
      quantity: i.quantity
    }));
    if (variantItems.length > 0) {
      await stockService.decrementMultiple(variantItems);
    }

    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: req.user._id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentIntentId,
      status: paymentIntentId ? 'paid' : 'pending',
    });

    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/orders (내 주문 목록)
exports.getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { user: req.user._id };
    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/orders/:id
exports.getById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    res.json(order);
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// ── Admin ──

// GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } }
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Order.countDocuments(query)
    ]);

    res.json({
      data: orders,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/admin/orders/:id
exports.getOrderDetail = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email phone');
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다' });
    res.json(order);
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// PUT /api/admin/orders/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: '주문을 찾을 수 없습니다' });

    // Plan SC: SC-07 — restore stock on cancellation
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        if (item.variant) {
          await stockService.increment(item.variant, item.quantity);
        }
      }
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
