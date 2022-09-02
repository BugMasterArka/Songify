const mongoose = require('mongoose');

const playListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    n_songs: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const PlayList = mongoose.model('playlist',playListSchema);

module.exports = PlayList;