const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getAll, getById, create, update, remove } = require('../controllers/categoryController');

router.get('/', getAll);
router.get('/:id', getById);

// Admin
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
