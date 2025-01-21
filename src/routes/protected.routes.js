const router = require('express').Router();
const sanitize = require('../middlewares/sanitize-body');

router.use('/users', sanitize, require('./user.routes'));
router.use('/events', sanitize, require('./events.routes'));

module.exports = router;
