const mongoose = require('mongoose');

const likedSongSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const LikedSongs = mongoose.model('likedsong',likedSongSchema);

module.exports = LikedSongs;