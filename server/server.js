require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
// const session = require('express-session');
// const jwt = require('jsonwebtoken');
const db = require('./db');
// const adminRoutes = require('./adminRoutes');
// const fs = require('fs');
const { readJsonFile, writeJsonFile, isBlocked, /*isUserBlocked, */ authenticateAdmin } = require('./config');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// app.get('/', (req, res) => {
//   console.log('index.html')
//   res.sendFile(path.join(__dirname, '../public/launching.html'));
// });

app.use(express.json());

let isLive = false;

// app.use(session({
//   secret: process.env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: { 
//     secure: process.env.NODE_ENV === 'production',
//     maxAge: 3600000
//   }
// }));

// Middleware to check launch time
// app.use((req, res, next) => {
//   const now = new Date();
//   const launchTime = new Date();
//   launchTime.setHours(22, 30, 0); // Set to 10:30 PM

//   if (now < launchTime && req.path !== '/launching') {
//     res.redirect('/launching');
//   } else if (now >= launchTime && req.path === '/launching') {
//     res.redirect('/');
//   } else {
//     next();
//   }
// });

app.get('/', (req, res) => {
  if(isLive==false) return res.redirect('/launching');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Launching page route
app.get('/launching', (req, res) => {
  if(isLive==true) return res.redirect('/');
  res.sendFile(path.join(__dirname, '../public/launching.html'));
});

app.use(express.static(path.join(__dirname, '../public')));


let onlineUsers = new Set();
let blockedUsers = new Set();

io.on('connection', (socket) => {
  const clientIp = socket.handshake.address;
  console.log('new connection from', clientIp);
  
  // Update users.json with connected user
  const users = readJsonFile('./server/users.json');
  if (!users.connected_users.includes(clientIp)) {
      users.connected_users.push(clientIp);
      writeJsonFile('./server/users.json', users);
  }
  
  onlineUsers.add(clientIp);

  socket.on('websiteName', () => {
    io.emit('websiteName', process.env.WEBSITE_NAME);
  })

  io.to(socket.id).emit('ip', clientIp);
  db.setVotesOfUser(clientIp);
  
  socket.on('load', (key) => {
    const isAdmin = key === process.env.ADMIN_SECRET_KEY;
    io.to(socket.id).emit('load', {
      thoughts: db.getThoughts(isAdmin ? key : null),
      
      userVotes: Array.from(new Set(db.getVotes(clientIp))),
      isAdmin: isAdmin
    });
  })
  
  io.emit('updateOnlineUsers', onlineUsers.size);

  socket.on('disconnect', () => {
    onlineUsers.delete(clientIp);
    // const users = readJsonFile('./server/users.json');
    // users.connected_users = users.connected_users.filter(ip => ip !== clientIp);
    // writeJsonFile('./server/users.json', users);
    io.emit('updateOnlineUsers', onlineUsers.size);
  });

  socket.on('newThought', (props) => {
    if(!isBlocked(clientIp)){
      // console.log('new thought', props.thought)
      
      // Update thoughts.json
      const thoughts = readJsonFile('./server/thoughts.json');
      const userThoughts = thoughts.find(t => t.ip === clientIp);
      
      const newThought = {
          content: props.thought,
          time: new Date().toISOString()
      };

      if (userThoughts) {
          userThoughts.thoughts.push(newThought);
      } else {
          thoughts.push({
              ip: clientIp,
              thoughts: [newThought]
          });
      }

      writeJsonFile('./server/thoughts.json', thoughts);
      
      db.addThought(props.thought, clientIp);
      io.emit('updateThoughts', db.getThoughts(props.key));
    }
    else{
      io.to(socket.id).emit('userBlocked');
    }
  });

  socket.on('vote', (props) => {
    db.voteThought(props.thoughtId, clientIp);
    io.emit('updateThoughts', db.getThoughts(props.key));
  });
  
  socket.on('deleteVote', (props) => {
    db.deleteVote(props.thoughtId, clientIp);
    io.emit('updateThoughts', db.getThoughts(props.key));
  });
});

app.post('/api/newThought', (req, res) => {

})

app.post('/admin/delete', authenticateAdmin, (req, res) => {
  const { key, thoughtId } = req.body;
  if(key===process.env.ADMIN_SECRET_KEY){
    db.deleteThought(thoughtId);
    io.emit('updateThoughts', db.getThoughts(key));
    res.json({ success: true });
  }else{
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.post('/admin/block', authenticateAdmin, (req, res) => {
  const { key, userIP } = req.body;
  if(key===process.env.ADMIN_SECRET_KEY){
    blockedUsers.add(userIP);
    
    // Update users.json with blocked user
    const users = readJsonFile('./server/users.json');
    if (!users.blocked_users.includes(userIP)) {
        users.blocked_users.push(userIP);
        writeJsonFile('./server/users.json', users);
    }
    
    console.log('[Blocking User]', userIP);
    res.json({ success: true });
  }else{
    res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/admin/:key/go-live', (req, res) => {
  const key = req.params.key;
  if(key==process.env.ADMIN_SECRET_KEY){
    isLive = true;
    res.json({
      message: 'Portal is Live!'
    })
  }
  else{
    res.redirect('/');
  }
})

app.get('/admin/:key/go-offline', (req, res) => {
  const key = req.params.key;
  if(key==process.env.ADMIN_SECRET_KEY){
    isLive = false;
    res.json({
      message: 'Portal is Offline!'
    })
  }
  else{
    res.redirect('/');
  }
})

app.get('/admin/:key/refresh-data', (req, res) => {
  const key = req.params.key;
  if(key==process.env.ADMIN_SECRET_KEY){
    const users_template = readJsonFile('./users.json');
    const thoughts_template = readJsonFile('./thoughts.json');

    db.refreshData();
    writeJsonFile('./server/users.json', users_template);
    writeJsonFile('./server/thoughts.json', thoughts_template);
    res.json({
      message: 'Data refreshed successfully!'
    })
  }
  else{
    res.redirect('/');
  }
})

app.get('/admin/:key/:filename', (req, res) => {
  const key = req.params.key;
  const filename = req.params.filename;
  if(key==process.env.ADMIN_SECRET_KEY){
    res.sendFile(__dirname + `/${filename}.json`);
  }
  else{
    res.redirect('/');
  }
})

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST_IP || 'localhost';

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
});
