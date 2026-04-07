// Design Ref: §2.1 — Separate Variant collection for SKU unique index + atomic $inc
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  sku: { type: String, required: true, unique: true, trim: true, uppercase: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  options: { type: Map, of: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

variantSchema.index({ product: 1, isActive: 1 });

module.exports = mongoose.model('Variant', variantSchema);
