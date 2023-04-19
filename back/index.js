const express = require('express');
const app = express();
const PORT = 4000;

//New imports
const http = require('http').Server(app);
const cors = require('cors');

app.use(cors());

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello world',
  });
});

const socketIO = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:5173"
    },
    // path: "/back"
});

let users = [];

//Add this before the app.get() block
socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);

    //Listens and logs the message to the console
    socket.on('message', (data) => {
      socketIO.emit('messageResponse', data);
    });

    //Listens when a new user joins the server
    socket.on('newUser', (data) => {
      //Adds the new user to the list of users
      users.push(data);
      // console.log(users);
      //Sends the list of users to the client
      socketIO.emit('newUserResponse', users);
    });

    socket.on('typing', (data) => socket.broadcast.emit('typingResponse', data));

    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
      //Updates the list of users when a user disconnects from the server
      users = users.filter((user) => user.socketID !== socket.id);
      // console.log(users);
      //Sends the list of users to the client
      socketIO.emit('newUserResponse', users);
      socket.disconnect();
    });
});

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});