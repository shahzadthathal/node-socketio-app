var app = require('express')();
var mysql = require('mysql');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var port = process.env.PORT || 3000;


//app.use(app.static('public'));
//app.use('/static', app.static(__dirname + '/public'));

var pool  = mysql.createPool({
    connectionLimit : 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ob_support_system'
});


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
var rooms = ['Default Admin'];

io.sockets.on('connection', function (socket) {

  	  //login user
      socket.on('loginUser', function(data){
        loginUser(socket,data);
      });

	// when the client emits 'adduser', this listens and executes
	socket.on('register', function(data){
		
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

		socket.emit('updatechat', 'SERVER', 'you have connected'+socket.room);
		// echo to room 1 that a person has connected to their room
		socket.broadcast.to(data.first_name).emit('updatechat', 'SERVER', data.first_name + ' has connected to this room');
		//socket.emit('updaterooms', rooms, data.first_name);
		socket.emit('updateCustomerRoom', data.first_name, data.message);
		io.emit('updateRooms', rooms, data.first_name);
	});

	// when the client emits 'sendchat', this listens and executes
	socket.on('sendchat', function (message) {
		// we tell the client to execute 'updatechat' with 2 parameters
		var data = {
			message:message,
			room:socket.room
		}
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
		socket.emit('updateRooms', rooms, newroom);
	});

	socket.on('getRooms', function(data){
		if(data.token == 'rsSERSFG345adsf')
		{
			console.log('Token matched');
			getRooms();
		}
		else{
			console.log('Token mis matched');
		}
	})

	// when the user disconnects.. perform this
	socket.on('disconnect', function(){

		 //rooms.splice(socket.username, 1);
		// remove the username from global usernames list
		delete usernames[socket.username];
		// update list of users in chat, client-side
		io.sockets.emit('updateusers', usernames);
		// echo globally that this client has left
		socket.broadcast.emit('updatechat', 'SERVER', socket.username + ' has disconnected');
		socket.leave(socket.room);
	});
});



function getRooms()
{
	 io.emit('getRooms', rooms);
}





function loginUser(socket, data)
{
  pool.getConnection(function(err, connection) {
    if(err)
        throw err;
      connection.query("SELECT id,first_name FROM support_user WHERE email = " + mysql.escape(data.email) + " AND password = "+  mysql.escape(data.password)  +"  LIMIT 1 " , function(err,row){
          if(err){
            throw err;
          }
          if(row.length > 0){

          	var adminName = row[0].first_name;
          	socket.username = adminName;
          	usernames[adminName] = adminName;

      		var user = {
		  					first_name: adminName,
		  					token:'rsSERSFG345adsf' 
	      				}; // latter we will use database token

            connection.query('UPDATE support_user SET socketid = ? WHERE id = ?', [socket.id,  row[0].id], function(err, results) {
       			if(err)
          			throw err;
          		  		io.to(socket.id).emit('loginUser',{
                                    success:1,
                                    msg:'Login Success!',
                                    user:user
                        });

          	});
          }
          else{
            io.to(socket.id).emit('login-user',{
                                      success:0,
                                      msg:'Invalid username or password'
                                    });
          }
      });
      connection.release();
  });
}

