const MediaModel = require("../../models/media");
const fs = require("fs");


/**
 * Uploads media to the server.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to a JSON object with a message indicating the status of the media upload. If no files are uploaded, a 400 error with a message "No files uploaded" is returned. If any required fields are missing, a 400 error with a message "All fields are required" is returned. If the media already exists, a 400 error with a message "Media already exists" is returned. If there is an error during the upload process, a 500 error with a message containing the error message is returned.
 */
exports.uploadMedia = async(req, res) => {
    const files = req.files;
  
    if (!files) {
      return res.status(400).json({ message: "No files uploaded" });
    }
  
    const { name, type, category, addedDate, releaseDate } = req.body;
  
    if (!name || !type || !category || !releaseDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const added = await MediaModel.findOne({ name });
  
      if (added) {
        fs.unlink(req.files["torrent"][0].path, (err) => {
          if (err) {
            console.error(err);
          }
        });
        fs.unlink(req.files["mediaPoster"][0].path, (err) => {
          if (err) {
            console.error(err);
          }
        });
        return res.status(400).json({ message: "Media already exists" });
      }
  
      const media = new MediaModel({
        name,
        type,
        category,
        pathTorrent: req.files["torrent"][0].path,
        pathPoster: req.files["mediaPoster"][0].path,
        addedDate,
        releaseDate,
      });
      await media.save();
  
      res.status(200).json({ message: "Media added successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  