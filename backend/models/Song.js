const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    liked: {
        type: Boolean,
        required: true
    },
    playlistId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'playlist'
    }],
    fileId:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const Songs = mongoose.model('song',songSchema);

module.exports = Songs;