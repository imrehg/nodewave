// require.paths.unshift(__dirname + '/lib');

var express = require('express');
var uuid = require('node-uuid');

var app = express.createServer(express.logger());
app.use(express.bodyParser());
app.set("views", __dirname + '/views');

// // create a socket.io backend for sending facebook graph data
// // to the browser as we receive it
var io = require('socket.io').listen(app);

io.configure(function(){
    io.set('log level', 3);
    io.set("transports", ["websocket", "xhr-polling"]);
});

var data = io.of('/data');
data.on('connection', function (socket) {
      console.log('Data connection');   
});

app.get('/', function(request, response) {

  var method = request.headers['x-forwarded-proto'] || 'http';
  var socket_id = uuid();

  response.render('home.ejs', {
          layout:   false,
          app:      app,
          home:     method + '://' + request.headers.host + '/',
          redirect: method + '://' + request.headers.host + request.url,
          socket_id: socket_id
        });
});

app.get('/test', function(request, response) {
    console.log('yeah!');
    data.emit('data', {message: "workeeeed!"});
    response.write("gulugulu");
    response.end();
});

app.post('/data', function(request, response) {
    console.log(request.body);
    var wavelength = request.param('wavelength', null)
      , channel = request.param('channel', null);
    outdata = {channel: channel, wavelength: wavelength};
    console.log(outdata);
    data.emit('update', outdata);
    response.send('OK');
});

var port = process.env.app_port || process.env.PORT || 3000;

app.listen(port, function() {
  console.log("Listening on " + port);
});

// var http = require('http');
// http.createServer(function (req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   res.end('Hello World\nApp (wavemeter) is running on Node.JS ' + process.version);
// }).listen(port);
