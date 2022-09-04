const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const PlayList = require('../models/PlayList');
const {upload,gfs,gridfsBucket} = require('../middleware/Storage');
const {detect} = require('detect-browser');
const { findOne } = require('../models/PlayList');

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
        // let song;
        // if(req.params.playlist==='defaultList'){
        //     song = new Song({
        //         name: req.file.originalname,
        //         fileId: req.file._id
        //     });
        // }else{
        //     let playlist = await PlayList.findOne({name: req.params.playlist});
        //     let savedList;
        //     if(!playlist){
        //         res.status(404).send("Playlist not found");
        //     }else{
        //         savedList = await PlayList.findByIdAndUpdate(playlist._id,{$set: {n_songs: playlist.n_songs+1}});
        //     }
        //     song = new Song({
        //         name: req.file.originalname,
        //         fileId: req.file._id,
        //         playlist: req.params.playlist,
        //         playlistId: savedList._id
        //     });
        // }

        let song = await Song.findOne({name: req.file.originalname});

        if(!song){
            if(req.params.playlist==='defaultList'){
                song = new Song({
                    name: req.file.originalname,
                    liked: true,
                    fileId: req.file.id,
                    playlistId: []
                });
            }else{
                let playlist = await PlayList.findOne({name: req.params.playlist});
                
                if(!playlist){
                    res.status(404).send("Playlist not found");
                }

                let savedList = await PlayList.findByIdAndUpdate(playlist._id,{$set: {n_songs: playlist.n_songs+1}});

                song = new Song({
                    name: req.file.originalname,
                    liked: true,
                    fileId: req.file.id,
                    playlistId: [savedList._id]
                });
            }

            song = await song.save();

            res.send(song);
        }else{
            let playlist = await PlayList.findOne({name: req.params.playlist});

            if(!playlist){
                res.status(404).send("Playlist not found");
            }

            let savedList = await PlayList.findByIdAndUpdate(playlist._id,{$set: {n_songs: playlist.n_songs+1}});

            let newId = [savedList._id];
            let newIdArray = song.playlistId.concat(newId);

            song = await Song.findByIdAndUpdate(song._id,{$set: {playlistId: newIdArray}});

            res.send(song);
        }

    }catch(error){
        console.log(error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

// route GET /api/songs/getallliked
// gets all the likeed songs from the database

router.get('/getallliked', async (req,res)=>{
    try{
        const likedSongs  = await Song.find({liked: true});
        res.json(likedSongs);
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// route GET /api/songs/getsongs/:id
// gets all the songs of a particular playlist

router.get('/getsongs/:id', async (req,res)=>{
    try{
        let list = await PlayList.findOne({_id: req.params.id});
        if(!list){
            return res.status(404).send("Playlist not found");
        }
        let listSongs = [];
        const songs = await Song.find();
        if(songs || songs.length!==0){
            songs.map((song)=>{
                if(song.playlistId.includes(req.params.id)){
                    listSongs.push(song);
                }
            });
        }
        res.json(songs);
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// route DELETE /api/songs/deletesong/:id
// delete particular song entirely from all databases

router.delete('/deletesong/:id', async (req,res)=>{
    try{
        let song = await Song.findById(req.params.id);

        if(!song){
            return res.status(404).send("Song not found");
        }

        gfs.files.findOne({_id: mongoose.Types.ObjectId(song.fileId)},(err,file)=>{
            if(!file){
                return res.status(404).send("No file exists");
            }
            gridfsBucket.delete(file._id);
        });

        song = await Song.findByIdAndDelete(req.params.id);

        res.send(song);
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// route DELETE /api/songs/deleteone/:id
// delete particular song from a playlist

router.delete('/deleteone/:info', async (req,res)=>{
    try{
        const data = JSON.parse(info);
        const songId = data.songId;
        const listId = data.playListId;

        let song = await findOne({_id: songId});
        if(!song){
            return res.status(404).send("Song not found");
        }

        let playList = await PlayList.findOne({_id: listId});
        if(!playList){
            return res.status(404).send("Playlist not found");
        }

        let listIndex = song.playListId.findIndex(listId);
        if(listIndex===-1){
            return res.status(404).send("Song not in playlist");
        }
        let newList = song.playListId.splice(listIndex,1);

        song = await Song.findByIdAndUpdate(songId,{$set: {playlistId: newList}});

        playList = await PlayList.findByIdAndUpdate(listId,{$set: {n_songs: playList.n_songs-1}});

        res.json({song,playList});
    }catch(error){
        console.log(error);
        res.status(500).send("Internal server error");
    }
});