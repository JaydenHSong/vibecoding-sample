const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  variant: { type: mongoose.Schema.Types.ObjectId, ref: 'Variant' },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  sku: { type: String },
  variantOptions: { type: Map, of: String },
  selectedOption: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'paid', 'shipping', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    detail: { type: String },
    zipCode: { type: String, required: true }
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'bank', 'virtual'],
    required: true
  },
  paymentIntentId: { type: String }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
