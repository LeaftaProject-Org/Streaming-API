const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/auth'));
router.use('/user',  require('./user/user'));
router.use('/admin', require('./admin/admin'));

module.exports = router;

