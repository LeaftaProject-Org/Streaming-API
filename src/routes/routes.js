const express = require('express');
const router = express.Router();
const authRoutes = require('./auth/auth');
const userRoutes = require('./user/user');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);

module.exports = router;

