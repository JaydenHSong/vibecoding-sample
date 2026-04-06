const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { getCart, addItem, updateItem, removeItem } = require('../controllers/cartController');

router.get('/', auth, getCart);
router.post('/', auth, addItem);
router.put('/:itemId', auth, updateItem);
router.delete('/:itemId', auth, removeItem);

module.exports = router;
