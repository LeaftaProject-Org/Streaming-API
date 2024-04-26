const router = require('express').Router();
const userController = require('../../controllers/userController');
const checkToken = require('../../middlewares/checkToken');

router.get('/data/fetch', checkToken, userController.getUserData);

module.exports = router;