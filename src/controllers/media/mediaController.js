const mediaModel = require("../../models/media");
const fs = require("fs-extra");

/**
 * Fetches all media with a download status of "DOWNLOADED" from the mediaModel.
 * Reads the poster image for each media object and returns a filtered array of media objects.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @return {Promise<Array>} A Promise that resolves to an array of filtered media objects.
 * If no media is found, returns a 404 status with a message "No media found".
 * If there is an error, returns a 500 status with an error object.
 */
exports.fetchAllMedia = async (req, res, next) => {
  try {
    const media = await mediaModel.find({ downloadStatus: "DOWNLOADED" });

    if (!media) {
      res.status(404).json({ message: "No media found" });
      return;
    }

    const filteredMedia = await Promise.all(
      media.map(async (mediaObj) => {
        const image = await fs.promises.readFile(mediaObj.pathPoster, {
          encoding: "base64",
        });

        const filteredMediaItem = {
          name: mediaObj.name,
          releaseDate: mediaObj.releaseDate,
          addedDate: mediaObj.addedDate,
          type: mediaObj.type,
          category: mediaObj.category,
          poster: image,
        };

        return filteredMediaItem;
      })
    );

    res.status(200).json(filteredMedia);
  } catch (error) {
    res.status(500).json({ error });
  }
};