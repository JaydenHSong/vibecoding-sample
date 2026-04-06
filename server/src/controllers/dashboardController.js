const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// GET /api/admin/dashboard
exports.getSummary = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalUsers,
      newUsersToday,
      totalProducts
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'customer', createdAt: { $gte: today } }),
      Product.countDocuments()
    ]);

    res.json({
      orders: { total: totalOrders, today: todayOrders },
      revenue: {
        total: totalRevenue[0]?.total || 0,
        today: todayRevenue[0]?.total || 0
      },
      users: { total: totalUsers, newToday: newUsersToday },
      products: { total: totalProducts }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    let days = 7;
    if (period === '30d') days = 30;
    if (period === '90d') days = 90;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [revenueByDate, topProducts, userGrowth] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { $unwind: '$items' },
        { $group: {
          _id: '$items.name',
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: startDate }, role: 'customer' } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({ revenueByDate, topProducts, userGrowth });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
};
