const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['MOVIE', 'TV SHOW', 'ANIME', 'SERIES'],
    },
    category: {
        type: String,
        required: true
    },
    addedDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    watched: {
        type: Boolean,
        required: true,
        default: false,
    },
    pathTorrent: {
        type: String,
        required: false,
    },
    pathPoster: {
        type: String,
        required: true,
    },
    pathMedia: {
        type: String,
    },
    downloadStatus: {
        type: String,
        required: true,
        enum: ['NOT DOWNLOADED', 'IN PROGRESS', 'DOWNLOADED', 'PAUSED'],
        default: 'NOT DOWNLOADED'
    },
    infoHash: {
        type: String,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Media', MediaSchema);