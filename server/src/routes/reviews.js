const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { create, getByProduct, getAll, approve, remove } = require('../controllers/reviewController');

router.post('/', auth, create);
router.get('/product/:productId', getByProduct);

// Admin
router.get('/', auth, adminOnly, getAll);
router.put('/:id/approve', auth, adminOnly, approve);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
