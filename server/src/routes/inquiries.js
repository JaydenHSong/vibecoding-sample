const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { create, getMine, getAll, answer } = require('../controllers/inquiryController');

router.post('/', auth, create);
router.get('/', auth, getMine);

// Admin
router.get('/all', auth, adminOnly, getAll);
router.put('/:id/answer', auth, adminOnly, answer);

module.exports = router;
