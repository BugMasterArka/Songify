const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const port = 5000;

app.use('/api/songs',require('./routes/songs'));
app.use('/api/playlist',require('./routes/PlayLists'));
app.use('/api/player',require('./routes/Player'));

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`);
});