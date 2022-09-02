const mongoose = require('mongoose');

const mongoURI = "mongodb://localhost:27017/songifySongs";

const conn = mongoose.createConnection(mongoURI);

module.exports = conn;