const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth/auth'));
router.use('/user',  require('./user/user'));
router.use('/admin', require('./admin/admin'));
router.use('/media',  require('./media/media'));

module.exports = router;

