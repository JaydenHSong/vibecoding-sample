const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true },
  description: { type: String },
  images: [{ type: String }],
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  options: [{
    name: { type: String },
    values: [{ type: String }]
  }],
  stock: { type: Number, required: true, default: 0 },
  isBestSeller: { type: Boolean, default: false },
  isNew: { type: Boolean, default: false },
  averageRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
