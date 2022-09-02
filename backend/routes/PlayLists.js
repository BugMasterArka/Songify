const express = require('express');
const router = express.Router();
const PlayList = require('../models/PlayList');
const { body, validationResult } = require('express-validator');

// ROUTE 1: POST create a playlist "/api/playlist/createlist"

router.post('/createlist',[
    body('name','Enter a valid name').isLength({min: 3})
], async (req,res)=>{

    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const {name} = req.body;

        let list = await PlayList.findOne({name: name});
        if(list){
            return res.status(400).send("Playlist Already Present");
        }

        let newList = new PlayList({
            name: name
        });

        let savedList = await newList.save();
        res.send(savedList);
    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 2: GET get all the playlist "/api/playlist/getlists"

router.get('/getlists', async (req,res)=>{
    try{

        const lists = await PlayList.find();
        res.json(lists);

    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 3: PUT update an existing list name "/api/playlist/updatelist/:id"

router.put('/updatelist/:id',[
    body('name','Enter a valid name').isLength({min: 3})
], async (req,res)=>{

    // if there are errors return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try{
        const {name} = req.body;

        let list = await PlayList.findById(req.params.id);

        if(!list){
            return res.status(404).send("Not found");
        }

        list = await PlayList.findByIdAndUpdate(req.params.id,{$set: {name: name}});

        res.json({list});

    }catch(error){
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

// ROUTE 4: DELETE delete a playlist "/api/playlist/deletelist/:id"

router.delete('/deletelist/:id', async (req,res)=>{
    try{
        let list = await PlayList.findById(req.params.id);
        if(!list){
            return res.status(404).send("Not found");
        }

        list = await PlayList.findByIdAndDelete(req.params.id);
        res.json({service: "List deletion",status: "success",list: list});
    }catch(error){
        console.log(error);
        res.status(500).send("Internal server error");
    }
});

