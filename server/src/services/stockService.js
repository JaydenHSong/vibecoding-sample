// Design Ref: §3.2 — StockService: atomic stock operations, race condition prevention
const mongoose = require('mongoose');
const Variant = require('../models/Variant');
const variantService = require('./variantService');

class StockService {
  async checkAvailability(variantId, quantity) {
    const variant = await Variant.findById(variantId);
    if (!variant || !variant.isActive) return { available: false, stock: 0 };
    return { available: variant.stock >= quantity, stock: variant.stock };
  }

  // Plan SC: SC-06 — atomic $inc prevents race condition
  async decrement(variantId, quantity) {
    const result = await Variant.findOneAndUpdate(
      { _id: variantId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!result) throw new Error('Insufficient stock');
    await variantService.syncProductAggregates(result.product);
    return result;
  }

  // Plan SC: SC-07 — restore stock on order cancel
  async increment(variantId, quantity) {
    const result = await Variant.findByIdAndUpdate(
      variantId,
      { $inc: { stock: quantity } },
      { new: true }
    );
    if (result) await variantService.syncProductAggregates(result.product);
    return result;
  }

  // Design Ref: §3.2 — availability map for frontend out-of-stock display
  async getAvailabilityMap(productId) {
    const variants = await Variant.find({ product: productId, isActive: true })
      .select('options stock price');
    return variants.map(v => ({
      options: v.options instanceof Map ? Object.fromEntries(v.options) : v.options,
      stock: v.stock,
      price: v.price,
      variantId: v._id
    }));
  }

  async decrementMultiple(items) {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const results = [];
      for (const { variantId, quantity } of items) {
        const result = await Variant.findOneAndUpdate(
          { _id: variantId, stock: { $gte: quantity } },
          { $inc: { stock: -quantity } },
          { new: true, session }
        );
        if (!result) {
          throw new Error(`Insufficient stock for variant ${variantId}`);
        }
        results.push(result);
      }
      await session.commitTransaction();

      // Sync aggregates for affected products
      const productIds = [...new Set(results.map(r => r.product.toString()))];
      await Promise.all(productIds.map(pid => variantService.syncProductAggregates(pid)));

      return results;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }
}

module.exports = new StockService();
