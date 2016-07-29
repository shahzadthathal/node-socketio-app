var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/',function(req,res){
	//res.send('Hello World!');
	 res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

	console.log(socket.id);

  socket.broadcast.emit('hi');

io.sockets.sockets[socket.id].emit("private", "This is only private message");

  socket.on('chat message', function(msg){
    console.log('message: ' + msg);
     io.emit('chat message', msg);
  });



  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

http.listen(3000,function(){
	console.log('Listing on 3000');
});


//Express initializes app to be a function handler that you can supply to an HTTP server (as seen in line 2).
//We define a route handler / that gets called when we hit our website home.
//We make the http server listen on port 3000.