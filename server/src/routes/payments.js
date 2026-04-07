const router = require('express').Router();
const { auth } = require('../middleware/auth');
const { createIntent, getConfig } = require('../controllers/paymentController');

router.get('/config', getConfig);
router.post('/create-intent', auth, createIntent);

module.exports = router;
