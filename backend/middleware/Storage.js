const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const conn = require('../db');
const mongoose = require('mongoose');
const path = require('path');

const mongoURI = "mongodb://localhost:27017/songifySongs";

let gfs, gridfsBucket;

conn.once('open',()=>{
    gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads'
    });

    gfs = Grid(conn.db,mongoose.mongo);
    gfs.collection('uploads');
});

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req,file) =>{
        return new Promise((resolve,reject) => {
            try {
                const filename = 'file_' + Date.now();
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
            resolve(fileInfo);
            } catch (error) {
                reject(error);
            }
        });
    }
});

const upload = multer({ storage });

module.exports = {upload,gfs,gridfsBucket};

