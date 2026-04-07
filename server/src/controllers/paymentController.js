const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Cart = require('../models/Cart');

// POST /api/payments/create-intent
exports.createIntent = async (req, res) => {
  try {
    // Recalculate amount from actual cart (never trust client amount)
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product items.variant');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const amount = cart.items.reduce((sum, item) => {
      const price = item.variant?.price || item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    if (amount < 0.50) {
      return res.status(400).json({ error: 'Minimum amount is $0.50' });
    }
    if (amount > 100000) {
      return res.status(400).json({ error: 'Amount exceeds maximum' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { userId: req.user._id.toString() },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: 'Payment initialization failed' });
  }
};

// GET /api/payments/config
exports.getConfig = (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};
