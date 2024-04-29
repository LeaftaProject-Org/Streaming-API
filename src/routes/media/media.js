const router = require('express').Router();
const mediaController = require('../../controllers/media/mediaController')
const checkToken = require('../../middlewares/checkToken');

router.get('/fetch/all', checkToken, mediaController.fetchAllMedia);

module.exports = router;