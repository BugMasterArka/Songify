const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const PlayList = require('../models/PlayList');
const upload = require('../middleware/Storage');
const {detect} = require('detect-browser');

// route POST /api/songs/addsong
// adds a new song to the chosen playlist (to liked songs if playlist given as "defaultList")
router.post('/addsong:playlist',upload.single('file'), async (req,res)=>{
    try{
        const browser = detect();
        let mimeCheck = true;
        if(browser){
            switch(browser){
                case 'chrome': if(!req.file.mimetype==='audio/mp3'){
                                    mimeCheck = false;
                                }
                                break;
                case 'firefox': if(!req.file.mimetype==='audio/mpeg'){
                                    mimeCheck=false;
                                }
                                break;
            }
        }else{
            res.status(400).json({error: "browser not supported"});
        }
        if(!mimeCheck){
            res.status(400).json({error: "filetype not supported"});
        }
        let song;
        if(req.params.playlist==='defaultList'){
            song = new Song({
                name: req.file.originalname,
                fileId: req.file._id
            });
        }else{
            let playlist = await PlayList.findOne({name: req.params.playlist});
            let savedList;
            if(!playlist){
                res.status(404).send("Playlist not found");
            }else{
                savedList = await PlayList.findByIdAndUpdate(playlist._id,{$set: {n_songs: playlist.n_songs+1}});
            }
            song = new Song({
                name: req.file.originalname,
                fileId: req.file._id,
                playlist: req.params.playlist,
                playlistId: savedList._id
            });
        }

        let savedSong = await song.save();

        res.send(savedSong);
    }catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// router 

