// Design Ref: §3.1 — VariantService: CRUD, combination generation, Product sync
const Variant = require('../models/Variant');
const Product = require('../models/Product');

class VariantService {
  generateCombinations(options) {
    if (!options || options.length === 0) return [{}];
    const [first, ...rest] = options;
    const restCombos = this.generateCombinations(rest);
    const combos = [];
    for (const value of first.values) {
      for (const combo of restCombos) {
        combos.push({ [first.name]: value, ...combo });
      }
    }
    return combos;
  }

  async getByProduct(productId) {
    return Variant.find({ product: productId, isActive: true }).sort({ createdAt: 1 });
  }

  async getById(variantId) {
    return Variant.findById(variantId);
  }

  async bulkUpsert(productId, variantsData) {
    const existing = await Variant.find({ product: productId });
    const existingMap = new Map();
    for (const v of existing) {
      const key = this._optionsKey(Object.fromEntries(v.options));
      existingMap.set(key, v);
    }

    const incomingKeys = new Set();
    const ops = [];

    for (const data of variantsData) {
      const key = this._optionsKey(data.options);
      incomingKeys.add(key);
      const existingVariant = existingMap.get(key);

      if (existingVariant) {
        ops.push(Variant.findByIdAndUpdate(existingVariant._id, {
          sku: data.sku,
          price: data.price,
          stock: data.stock,
          options: data.options,
          isActive: true
        }, { new: true }));
      } else {
        ops.push(Variant.create({
          product: productId,
          sku: data.sku,
          price: data.price,
          stock: data.stock ?? 0,
          options: data.options,
          isActive: true
        }));
      }
    }

    // Soft-delete removed combinations
    for (const [key, v] of existingMap) {
      if (!incomingKeys.has(key) && v.isActive) {
        ops.push(Variant.findByIdAndUpdate(v._id, { isActive: false }));
      }
    }

    const results = await Promise.all(ops);
    await this.syncProductAggregates(productId);
    return results.filter(Boolean);
  }

  // Plan SC: SC-01, SC-03 — sync Product.stock (sum) and Product.price (min)
  async syncProductAggregates(productId) {
    const variants = await Variant.find({ product: productId, isActive: true });
    if (variants.length === 0) return;
    const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);
    const minPrice = Math.min(...variants.map(v => v.price));
    await Product.findByIdAndUpdate(productId, { stock: totalStock, price: minPrice });
  }

  _optionsKey(options) {
    return Object.entries(options).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}:${v}`).join('|');
  }
}

module.exports = new VariantService();
