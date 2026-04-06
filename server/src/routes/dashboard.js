const express = require('express');
const router = express.Router();
const { auth, adminOnly } = require('../middleware/auth');
const { getSummary, getStats } = require('../controllers/dashboardController');

router.get('/', auth, adminOnly, getSummary);
router.get('/stats', auth, adminOnly, getStats);

module.exports = router;
