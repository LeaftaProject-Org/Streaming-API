<<<<<<< HEAD
const router = require('express').Router();
const userController = require('../../controllers/userController');
const checkToken = require('../../middlewares/checkToken');

router.get('/data/fetch', checkToken, userController.getUserData);

=======
const router = require('express').Router();
const userController = require('../../controllers/userController');
const checkToken = require('../../middlewares/checkToken');

router.get('/data/fetch', checkToken, userController.getUserData);

>>>>>>> 8fc2eea1501b177afeb880862a7e4a4d66a09a0b
module.exports = router;