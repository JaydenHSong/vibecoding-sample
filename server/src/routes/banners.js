const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getActive, getAll, create, update, remove } = require('../controllers/bannerController');

router.get('/', getActive);

// Admin
router.get('/all', auth, adminOnly, getAll);
router.post('/', auth, adminOnly, create);
router.put('/:id', auth, adminOnly, update);
router.delete('/:id', auth, adminOnly, remove);

module.exports = router;
