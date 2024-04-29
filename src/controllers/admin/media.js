const MediaModel = require("../../models/media");
const fs = require("fs");

/**
 * Uploads media to the server.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to a JSON object with a message indicating the status of the media upload. If no files are uploaded, a 400 error with a message "No files uploaded" is returned. If any required fields are missing, a 400 error with a message "All fields are required" is returned. If the media already exists, a 400 error with a message "Media already exists" is returned. If there is an error during the upload process, a 500 error with a message containing the error message is returned.
 */
exports.uploadMedia = async (req, res) => {
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

/**
 * Deletes a media item from the database and the file system.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to a JSON object with a message indicating the status of the deletion. If the name parameter is missing, a 400 error with a message "Missing the params called name" is returned. If the media item is not found, a 400 error with a message "Media not found" is returned. If there is an error during the deletion process, a 500 error with a message containing the error message is returned.
 */
exports.deleteMedia = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing the params called ID" });
  }

  try {
    const media = await MediaModel.findById(id);

    if (!media) {
      return res.status(400).json({ message: "Media not found" });
    }

    fs.unlink(media.pathTorrent, (err) => {
      if (err) {
        console.error(err);
      }
    });

    fs.unlink(media.pathPoster, (err) => {
      if (err) {
        console.error(err);
      }
    });

    if (media.status === "DOWNLOADED") {
      fsExtra.remove(media.pathMedia);
    }

    await MediaModel.deleteOne({ _id: id });

    res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Edits a media item in the database.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to a JSON object with a message indicating the status of the media update. If the ID parameter is missing, a 400 error with a message "Missing the params called ID" is returned. If the media item is not found, a 400 error with a message "Media not found" is returned. If there is an error during the update process, a 500 error with a message containing the error message is returned.
 */
exports.editMedia = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing the params called ID" });
  }

  try {
    const media = await MediaModel.findById(id);

    if (!media) {
      return res.status(400).json({ message: "Media not found" });
    }

    const { name, type, category, releaseDate } = req.body;

    if (name) {
      media.name = name;
    }

    if (type) {
      media.type = type;
    }

    if (category) {
      media.category = category;
    }

    if (releaseDate) {
      media.releaseDate = releaseDate;
    }

    await media.save();

    res.status(200).json({ message: "Media updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves all media items from the database and sends them as a JSON response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<void>} - A promise that resolves when the response is sent.
 */
exports.getAllMedia = async (req, res) => {
  const media = await MediaModel.find();

  if (!media) {
    return res.status(404).json({ message: "No media found" });
  }

  res.status(200).json({ media });
};

/**
 * Retrieves a media item from the database based on the provided ID and sends it as a JSON response.
 *
 * @param {Object} req - The request object containing the media ID in the query.
 * @param {Object} res - The response object used to send the media data.
 * @return {Promise<void>} - A promise that resolves when the media data is sent.
 */
exports.getMedia = async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Missing the params called ID" });
  }

  const media = await MediaModel.findById(id);

  if (!media) {
    return res.status(404).json({ message: "Media not found" });
  }
  
  res.status(200).json({ media });
};
