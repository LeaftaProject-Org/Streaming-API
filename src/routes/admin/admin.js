const router = require('express').Router();
const adminController = require('../../controllers/adminController')
const checkToken = require('../../middlewares/checkToken');
const checkAdmin = require('../../middlewares/checkAdmin');
const multer = require('multer');

const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            if (file.fieldname === "torrent") {
                cb(null, './src/uploads/torrents');
            } else if (file.fieldname === "mediaPoster") {
                cb(null, './src/uploads/posters');
            }
        },
        filename: function(req, file, cb) {
            cb(null,  Date.now()  + '-' + file.originalname);
        }
    })
}).fields([
    { name: 'torrent', maxCount: 1 },
    { name: 'mediaPoster', maxCount: 1 }
]);

router.post('/upload/media', checkToken, checkAdmin, upload, adminController.uploadMedia);
router.post('/download/torrent/start', checkToken, checkAdmin, adminController.downloadTorrent);
router.get('/download/torrent/all/status', checkToken, checkAdmin, adminController.getAllTorrentStatus);

module.exports = router;
