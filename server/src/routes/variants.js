const router = require('express').Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getByProduct, bulkUpsert, update, remove } = require('../controllers/variantController');

// Public
router.get('/products/:productId/variants', getByProduct);

// Admin
router.post('/admin/products/:id/variants', auth, adminOnly, bulkUpsert);
router.put('/admin/variants/:id', auth, adminOnly, update);
router.delete('/admin/variants/:id', auth, adminOnly, remove);

module.exports = router;
