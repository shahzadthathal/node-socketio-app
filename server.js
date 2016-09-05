var app = require('express')();
var mysql = require('mysql');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;



http.listen(port,function(){

	console.log('Listing on http://localhost:'+port);

});

app.get('/',function(req,res){
	//res.send('Hello World!');
	 res.sendFile(__dirname + '/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};

// rooms which are currently available in chat
var rooms = ['Default Room'];
io.sockets.on('connection', function (socket) {

	// when the client emits 'adduser', this listens and executes
	socket.on('register', function(data){
		console.log(data);
		
		rooms.push(data.first_name);

		// store the username in the socket session for this client
		socket.username = data.first_name;
		// store the room name in the socket session for this client
		socket.room = data.first_name;
		// add the client's username to the global list
		usernames[data.first_name] = data.first_name;
		// send client to room 1
		socket.join(data.first_name);
		// echo to client they've connected

		
		console.log("rooms:",rooms);


		socket.emit('updatechat', 'SERVER', 'you have connected'+socket.room);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(data.first_name).emit('updatechat', 'SERVER', data.first_name + ' has connected to this room');
		socket.emit('updaterooms', rooms, data.first_name);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (data) {
		// we tell the client to execute 'updatechat' with 2 parameters
		io.sockets.in(socket.room).emit('updatechat', socket.username, data);
	});

	socket.on('switchRoom', function(newroom){
		// leave the current room (stored in session)
		socket.leave(socket.room);
		// join new room, received as function parameter
		socket.join(newroom);
		socket.emit('updatechat', 'SERVER', 'you have connected to '+ newroom);
		// sent message to OLD room
		socket.broadcast.to(socket.room).emit('updatechat', 'SERVER', socket.username+' has left this room');
		// update socket session room title
		socket.room = newroom;
		socket.broadcast.to(newroom).emit('updatechat', 'SERVER', socket.username+' has joined this room');
		socket.emit('updaterooms', rooms, newroom);
	});

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});