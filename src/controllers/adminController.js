const MediaModel = require("../models/media");
const fs = require("fs");

const importWebTorrent = async () => {
  const webTorrentModule = await import("webtorrent");
  return webTorrentModule.default || webTorrentModule;
};

const initializeWebTorrent = async () => {
  const WebTorrent = await importWebTorrent();
  const client = new WebTorrent();
  return client;
};

let client;
initializeWebTorrent().then((c) => {
  client = c;
});

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
 * Downloads a torrent with the given name.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to a JSON object with a message indicating the status of the torrent download. If the name is not provided in the query, a 400 error with a message "All fields are required" is returned. If the media with the given name is not found, a 400 error with a message "Media not found" is returned. If there is an error during the download process, a 500 error with a message containing the error message is returned.
 */
exports.downloadTorrent = async (req, res) => {
  const { name } = req.query;

  if (!name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const media = await MediaModel.findOne({ name });

    if (!media) {
      return res.status(400).json({ message: "Media not found" });
    }

    if (media.status === "DOWNLOADED") {
      return res.status(400).json({ message: "Torrent already downloaded" });
    } else if (media.downloadStatus === "IN PROGRESS") {
      return res.status(400).json({ message: "Torrent already in progress" });
    }

    let mediaPath;
    switch (media.type) {
      case "MOVIE": mediaPath = "movies"; break;
      case "TV SHOW": mediaPath = "tvshows"; break;
      case "ANIME": mediaPath = "animes"; break;
      case "SERIES": mediaPath = "series"; break;
      default: return res.status(400).json({ message: "Invalid media type" });
    }

    const pathTorrent = media.pathTorrent;
    media.downloadStatus = "IN PROGRESS";
    await media.save();

    client.add(pathTorrent, { path: `./src/uploads/medias/${mediaPath}` }, (torrent) => {
      media.infoHash = torrent.infoHash;
      media.save();

      torrent.on("done", async () => {
        media.downloadStatus = "DOWNLOADED";
        await media.save();
      });

      torrent.on("error", async (err) => {
        console.error("Error downloading torrent:", err);
        media.downloadStatus = "ERROR";
        await media.save();
      });
    });

    res.status(200).json({ message: "Torrent download started" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Retrieves a list of torrent downloads in progress and their corresponding information.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @return {Promise<Object>} A promise that resolves to an array of torrent download information objects.
 *                           Each object contains the following properties:
 *                           - infoHash: The info hash of the torrent.
 *                           - name: The name of the torrent.
 *                           - progress: The progress of the torrent download as a percentage.
 *                           - fileName: The name of the torrent file.
 *                           - downloaded: The amount of data downloaded in megabytes.
 *                           - uploaded: The amount of data uploaded in megabytes.
 * @throws {Object} If there are no torrents in progress, a 400 error with a message "No torrents in progress found" is returned.
 * @throws {Object} If there is an error retrieving the torrent downloads, a 500 error with a message containing the error message is returned.
 */
exports.getAllTorrentStatus = async (req, res) => {
  try {
    const torrents = client.torrents;

    if (!torrents || torrents.length === 0) {
      return res.status(400).json({ message: "No torrents in progress found" });
    }

    if (!torrents) {
      return res.status(400).json({ message: "No torrents in progress found" });
    }

    const torrentsDB = await MediaModel.find({ downloadStatus: "IN PROGRESS" });
    const torrentsInfos = [];

    for (const torrent of torrents) {
      const { infoHash, progress, name, downloaded, uploaded, timeRemaining } = torrent;

      const matchingTorrentDB = torrentsDB.find(
        (torrentDB) => torrentDB.infoHash === infoHash
      );

      if (matchingTorrentDB) {
        const image = await fs.promises.readFile(matchingTorrentDB.pathPoster, {
          encoding: "base64",
        });
        let formattedRemainingTime;

        if (timeRemaining > 0) {
          const seconds = Math.floor(timeRemaining / 1000);
          const minutes = Math.floor(seconds / 60);
          const hours = Math.floor(minutes / 60);

          if (hours > 0) {
            formattedRemainingTime = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
          } else if (minutes > 0) {
            formattedRemainingTime = `${minutes}m ${seconds % 60}s`;
          } else {
            formattedRemainingTime = `${seconds}s`;
          }
        } else {
          formattedRemainingTime = "Unknown";
        }

        torrentsInfos.push({
          infoHash,
          fileName: name,
          name: matchingTorrentDB.name,
          remainingTime: formattedRemainingTime,
          progress: Math.round(progress * 100 * 100) / 100,
          downloaded: (downloaded / 1024 / 1024).toFixed(2) + " MB",
          uploaded: (uploaded / 1024 / 1024).toFixed(2) + " MB",
          poster: `data:image/jpeg;base64,${image}`,

        });
      }

    }

    res.status(200).json(torrentsInfos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
