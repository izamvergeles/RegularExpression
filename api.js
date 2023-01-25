const express = require('express');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require("path");
const websocket = require('ws');
const http = require('http');
const child_process = require("child_process");
const mongoose = require("mongoose");

require('dotenv').config()

const app = express();

app.use(cors());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(express.static(__dirname));

const server = http.createServer(app);
server.listen(3001, () => {
  console.log("Server running on port 3001");
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
});


//Register
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});
mongoose.set('strictQuery', true);
const User = mongoose.model('User', userSchema);
app.post('/register', async (req, res) => {
  if (req.body.email || req.body.password) {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      res.json({ error: "The user alredy exists" });
    } else {
      try {
        mongoose.connect(process.env.MONGODB_URL);
        console.log("Database connected");
        let hashedPassword = await bcrypt.hash(req.body.password, 10);
        let user = new User({
          email: req.body.email,
          password: hashedPassword,
        });
        user.save();
        console.log("Inserted new user");
        res.json({ message: "User Created" });
      } catch (err) {
        console.log("Connection Error: " + err);
        res.json({ error: "Register error, try again..." });
      };
    }
  } else {
    res.json({ error: "The user and password are required" });
  }
});

//Login
app.post('/login', async (req, res) => {
  if (req.body.email || req.body.password) {
    try {
      mongoose.connect(process.env.MONGODB_URL);
      console.log("Database connected");
      let user = await User.findOne({ email: req.body.email });
      if (bcrypt.compareSync(req.body.password, user.password)) {
        console.log("User verified");
        const token = jwt.sign({
          email: req.body.email,
          password: req.body.password,

        }, process.env.TOKEN_SECRET, {
          expiresIn: "10m"
        })
        res.header('auth-token', token).json({
          error: null,
          data: { token }
        })
      } else {
        console.log("The username or password is incorrect");
      }
    } catch (err) {
      res.json({ error: "Login Error" });
      console.log("Login Error");
    };
  } else {
    res.json({ error: "The user and password are required" });
  };
});

//WebSocket to control each request
const wss = new websocket.Server({ server: server, path: '/wss' });
let count = 0;
wss.on('connection', (ws) => {
  ws.on('connection', function (connection) {
    console.log('WebSocket Client Connected');
  });
  ws.on('error', error => {
    console.log("Connection Error: " + error.toString());
  });
  ws.on('close', () => {
    console.log('Connection Closed');
  });
  ws.on('message', message => {
    let header = message.toString().split(",");
    let token = header[0];
    if (!token) {
      ws.send('A token is required for authentication');
    } else {
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
        request(header[1]);
      } catch (err) {
        ws.send("Invalid Token");
      };
    };

    function request(message) {
      if (count < 5) {
        count++
        //console.log("Received: '" + message + "'Attempts: " + count);
        let operator = "Evaluar[" + message + "];"
        var workerProcess = child_process.exec('node ./parseator.js ' + operator,
          function (error, stdout, stderr) {
            if (error) {
              //console.log(error.stack);
              //console.log('Error code: ' + error.code);
              //console.log('Signal received: ' + error.signal);
            }
            //console.log('stdout: ' + stdout);
            ws.send(stdout);
          });
        workerProcess.on('exit', function (code) {
          //console.log('Child process exited with exit code ' + code);
        });
      } else {
        ws.send('You can not do more requests');
        ws.close();
      };
    };
  });
});


