const express = require('express');
const {Server} = require('socket.io');
const cors = require('cors');
const app = express();

const PORT = 5000;


app.use(cors());
app.use(express.json());


let maxLive = 0;

function getActiveSocketsCount(){
    let activeSocketsCount = io.sockets.sockets.size - 1;
    return activeSocketsCount;
}

function LogLiveCount(count){
    console.log("Live:",count);

    if(count > maxLive){
        console.log("Max Live:",count);
        maxLive = count;
    }
}

function LogMessage(message){
    console.log("Message:",message);
}


app.get('/',(req,res)=>{
    res.write("Hello");
    res.end();
});

app.post('/message',(req,res)=>{
    let newMessage = req.body.message;
    LogMessage(newMessage);

    let count = getActiveSocketsCount()
    io.emit('updateChat',{newMessage:newMessage,liveCount:count});

    res.send({status:"success"}).status(200).end();
})

const server = app.listen(PORT,()=>{
    console.log("listening on port",PORT);
});

const io = new Server(server,{
    cors:{
        origin:['https://ghostchat.ccbp.tech','http://127.0.0.1:5500']
    }
});

io.on('connection',(socket)=>{

    //update live count
    let count = getActiveSocketsCount();
    io.emit('countChange',{liveCount:count});

    LogLiveCount(count);

    //sendToFreinds Event
    socket.on('sendToFriends',(data)=>{
        io.emit('updateChat',{newMessage:data.message});
    });


    socket.on('disconnect', () => {
        let count = getActiveSocketsCount();
        io.emit('countChange',{liveCount: count});
        LogLiveCount(count);
    });
});





io.emit('updateChat',{newMessage:"Hello Welcome to the Ghost chat"});




