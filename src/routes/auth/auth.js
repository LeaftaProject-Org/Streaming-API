const router = require('express').Router();
const authController = require('../../controllers/auth/authController')

router.post('/sign-up', authController.signup);
router.post('/sign-in', authController.signin);

module.exports = router;