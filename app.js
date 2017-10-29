'use strict';

var express = require('express');
var app = express()

var server = require('http').Server(app);
require('./routes/socket.js')(server);

server.listen(3000);
app.use(require('./route.js'))
