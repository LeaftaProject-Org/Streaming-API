const router = require('express').Router();
const userController = require('../../controllers/admin/user');
const mediaController = require('../../controllers/admin/media');
const torrentController = require('../../controllers/admin/torrent');
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

/*User */
router.get('/data/user/fetch/all', checkToken, checkAdmin, userController.getAllUser);

/*Media */
router.post('/upload/media', checkToken, checkAdmin, upload, mediaController.uploadMedia);

/*Torrent*/
router.post('/download/torrent/start', checkToken, checkAdmin, torrentController.startDownloadTorrent);
router.post('/download/torrent/pause', checkToken, checkAdmin, torrentController.pauseDownloadTorrent);
router.post('/download/torrent/resume', checkToken, checkAdmin, torrentController.resumeDownloadTorrent);
router.post('/download/torrent/stop', checkToken, checkAdmin, torrentController.stopDownloadTorrent);
router.get('/download/torrent/all/status', checkToken, checkAdmin, torrentController.getAllTorrentStatus);

module.exports = router;
