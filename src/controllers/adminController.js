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

    let pathTorrent = media.pathTorrent;
    let mediaPath;

    if (media.type === "MOVIE") {
      mediaPath = "movies";
    } else if (media.type === "TV SHOW") {
      mediaPath = "tvshows";
    } else if (media.type === "ANIME") {
      mediaPath = "animes";
    } else if (media.type === "SERIES") {
      mediaPath = "series";
    }

    client.add(
      pathTorrent,
      { path: "./src/uploads/medias/" + mediaPath },
      async (torrent) => {
        media.downloadStatus = "IN PROGRESS";
        media.infoHash = torrent.infoHash;
        await media.save();

        torrent.on("done", async () => {
          media.status = "DOWNLOADED";
          await media.save();

          client.destroy((err) => {
            if (err) throw err;
            process.exit();
          });
        });

        torrent.on("error", (err) => {
          console.error("Error downloading torrent:", err);
        });
      }
    );

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

    if (!torrents) {
      return res.status(400).json({ message: "No torrents in progress found" }); 
    }

    const torrentsDB = await MediaModel.find({ downloadStatus: "IN PROGRESS" });
    const torrentsInfos = [];

    for (const torrent of torrents) {
      const { infoHash, progress, name, downloaded, uploaded } = torrent;
      const matchingTorrentDB = torrentsDB.find(
        (torrentDB) => torrentDB.infoHash === infoHash
      );

      if (matchingTorrentDB) {
        const image = await fs.promises.readFile(matchingTorrentDB.pathPoster, {
          encoding: "base64",
        });        
        
        torrentsInfos.push({
          infoHash,
          name: matchingTorrentDB.name,
          progress: Math.round(progress * 100 * 100) / 100,
          fileName: name,
          downloaded: (downloaded / 1024 / 1024).toFixed(2) + " MB",
          uploaded: (uploaded / 1024 / 1024).toFixed(2) + " MB",
          poster: `data:image/jpeg;base64,${image}`,
        });
      }
    }

    res.status(200).json(torrentsInfos); // Send response once with all data
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
