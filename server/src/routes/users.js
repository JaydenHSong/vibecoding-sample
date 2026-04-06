const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const {
  getMe, updateMe,
  getAddresses, addAddress, updateAddress, deleteAddress,
  toggleWishlist, getWishlist,
  getAllUsers, getUserById
} = require('../controllers/userController');

// Customer routes
router.get('/me', auth, getMe);
router.put('/me', auth, updateMe);
router.get('/me/addresses', auth, getAddresses);
router.post('/me/addresses', auth, addAddress);
router.put('/me/addresses/:addressId', auth, updateAddress);
router.delete('/me/addresses/:addressId', auth, deleteAddress);
router.get('/me/wishlist', auth, getWishlist);
router.post('/me/wishlist/:productId', auth, toggleWishlist);

// Admin routes
router.get('/', auth, adminOnly, getAllUsers);
router.get('/:id', auth, adminOnly, getUserById);

module.exports = router;
