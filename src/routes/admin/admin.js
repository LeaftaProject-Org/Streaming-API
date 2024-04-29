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
router.get  ('/data/user/fetch', checkToken, checkAdmin, userController.getUser);
router.post('/data/user/update', checkToken, checkAdmin, userController.editUser);

/*Media */  
router.post('/media/upload', checkToken, checkAdmin, upload, mediaController.uploadMedia);
router.post('/media/delete', checkToken, checkAdmin, mediaController.deleteMedia);
router.post('/media/edit', checkToken, checkAdmin, mediaController.editMedia);
router.get('/media/fetch/all', checkToken, checkAdmin, mediaController.getAllMedia);
router.get('/media/fetch', checkToken, checkAdmin, mediaController.getMedia);

/*Torrent*/
router.post('/torrent/download/start', checkToken, checkAdmin, torrentController.startDownloadTorrent);
router.post('/torrent/download/pause', checkToken, checkAdmin, torrentController.pauseDownloadTorrent);
router.post('/torrent/download/resume', checkToken, checkAdmin, torrentController.resumeDownloadTorrent);
router.post('/torrent/download/stop', checkToken, checkAdmin, torrentController.stopDownloadTorrent);
router.get('/torrent/download/all/status', checkToken, checkAdmin, torrentController.getAllTorrentStatus);

module.exports = router;
