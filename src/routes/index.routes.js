const sanitize = require('../middlewares/sanitize-body');
const { validateToken } = require('../middlewares/validate-token');

const router = require('express').Router();

router.use('/api/ping', (req, res) => res.status(200).json('App Working'));
router.use('/api/auth', sanitize, require('./auth.routes'));
router.use('/api', validateToken, require('./protected.routes'));

module.exports = router;
