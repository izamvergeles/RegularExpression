var proxy = require('express-http-proxy');
const express = require('express');
const app = express();
const http = require('http');

const server = http.createServer(app);
server.listen(3030, () => {
  console.log("Server running on port 3030");
});

app.use('/', proxy('http://localhost:3001/'));
app.post('/login', proxy('http://localhost:3001/login'));
app.post('/register', proxy('http://localhost:3001/register'));