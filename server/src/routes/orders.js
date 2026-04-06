const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { create, getMyOrders, getById, getAllOrders, getOrderDetail, updateStatus } = require('../controllers/orderController');

// Customer
router.post('/', auth, create);
router.get('/', auth, getMyOrders);
router.get('/:id', auth, getById);

// Admin
router.get('/admin/all', auth, adminOnly, getAllOrders);
router.get('/admin/:id', auth, adminOnly, getOrderDetail);
router.put('/admin/:id/status', auth, adminOnly, updateStatus);

module.exports = router;
