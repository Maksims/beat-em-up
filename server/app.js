var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server, { log: false });
var path = require('path');

require('./modules/mootools-core-1.4.5-server');
require('./modules/client').init(express, app, io, path.normalize(process.cwd() + '/../client'));
require('./modules/world').init(io);
require('./modules/match').init(io);
require('./modules/math');
require('./modules/user').init(io);
require('./modules/lobby').init(io);
require('./modules/team').init(io);
require('./modules/player').init(io);

// start

server.listen(88);
console.log('running');

var counter = 0;
var message = 'hello world';

app.get('/counter', function(req, res, next) {
  if (req.query.message != undefined) {
    message = req.query.message;
  }
  res.json({
    counter: ++counter,
    message: message
  });
});