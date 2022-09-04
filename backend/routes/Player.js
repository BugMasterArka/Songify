const express = require('express');
const router = express.Router();
const {gfs,gridfsBucket} = require('../middleware/Storage');
const Song = require('../models/Song');

// route GET /api/player/playsong/:id
// plays the song

router.get('/playsong/:id', async (req,res)=>{
    try{
        const song = await Song.findById(req.params.id);
        if(!song){
            return res.status(404).send("Song doesn't exist");
        }

        let songFile = await gfs.files.findOne({_id: song.fileId});

        if(!songFile){
            return res.status(404).send("Song not present in file database");
        }

        if(songFile.contentType === 'audio/mp3' || songFile.contentType === 'audio/mpeg'){
            const readStream = gridfsBucket.openDownloadStream(songFile._id);
            readStream.pipe(res);
        }else{
            return res.status(415).send("file not a song");
        }
    }catch(error){
        console.log(error);
        return res.status(500).send("Internal Server Error");
    }
});