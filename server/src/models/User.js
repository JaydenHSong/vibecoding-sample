const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  label: { type: String, required: true },
  address: { type: String, required: true },
  detail: { type: String },
  zipCode: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  addresses: [addressSchema],
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
