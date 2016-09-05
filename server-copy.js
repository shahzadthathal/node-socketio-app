var app = require('express')();
var mysql = require('mysql');
var http = require('http').Server(app);
var io = require('socket.io')(http);


var port = process.env.PORT || 3000;

var pool  = mysql.createPool({
    connectionLimit : 10,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ob_support_system'
});


pool.getConnection(function(err, connection) {
  // Use the connection
  connection.query( 'SELECT * FROM support_user where email = "shahzad@app.com"', function(err, rows) {
    // And done with the connection.
    connection.release();

    //console.log(rows);

    // Don't use the connection here, it has been returned to the pool.
  });
});


app.get('/',function(req,res){
	//res.send('Hello World!');
	 res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

    //chat user
      socket.on('support-message', function(data){
         var userMessage = {
                      message:data.msg,
                    };
        insertMessage(userMessage,'support-message',data.usrConnectedSocket);
         //io.to(data.usrConnectedSocket).emit('support-message',res);
      });

     // register user
      socket.on('register',function(data){
        var user = {
                    first_name: data.first_name,
                    email:      data.email,
                    socketid:  socket.id  //socketid:   mysql.escape(socket.id)
                  };
        var userMessage = {
                    message: data.message
        };
        checkUniqueEmail(user,userMessage);                 
      });
 

      //login user
      socket.on('login-user', function(data){
        loginUser(socket.id,data);
      });

      // socket disconnect
      socket.on('disconnect', function(){
        console.log('user disconnected');
      });

});

function checkUniqueEmail(user, userMessage)
{
  pool.getConnection(function(err, connection) {
    if(err)
        throw err;
       connection.query("SELECT id FROM support_user WHERE email = " + mysql.escape(user.email) + " LIMIT 1 " , function(err,row){
        if(err){
          console.log(err);
        }
        if(row.length > 0){
            userMessage.sender_id = row[0].id;
            updateUser(row[0].id , user.socketid, connection);
        }
        else{
          registerUser(user, userMessage, connection);
        }
      });
      connection.release();
  });
}
function registerUser(user, userMessage, connection)
{

      var query = connection.query('INSERT INTO support_user SET ?', user, function(err, result) {
        if(err)
          throw err;

        if(result){
          userMessage.sender_id = result.insertId;
          insertMessage(userMessage,'register',user.socketid);
        }
      });
      //console.log(query.sql);      
}
function insertMessage(userMessage,event,socketId)
{
  pool.getConnection(function(err, connection) {
  if(err)
      throw err;

   connection.query("SELECT id, socketid FROM support_user WHERE role_id in(1,2,4)  LIMIT 1 " , function(err,row){
        if(err){
           throw err;
        }
        if(row.length > 0){
            var reply_socketid = row[0].socketid;
            userMessage.receiver_id = row[0].id;
           // updateUser(row[0].id , user.socketid);
            var query2 = connection.query('Insert into support_message set ?', userMessage, function(err,result){
              if(err)
                throw err;
              if(result){
                // send messagae to user
                io.to(socketId).emit(event,{
                            success:1,
                            msg:userMessage.message,
                            usrConnectedSocket:socketId,
                            replysocketid : reply_socketid
                });

                // send message to support admin
                 var res = {
                      msg:userMessage.message,
                      usrConnectedSocket:socketId,
                      replysocketid: reply_socketid
                    };
                io.to(reply_socketid).emit('support-message',res);

                return;
              }
            });               
        }
        else{
          var query2 = connection.query('Insert into support_message set ?', userMessage, function(err,result){
              if(err)
                throw err

              io.to(socketId).emit(event,{
                              success:1,
                              msg:userMessage.message,
                              usrConnectedSocket:socketId
              });

          });
        }
    });
   connection.release();
  });
}

function updateUser(userId,socketId, event, message, connection)
{
    connection.query('UPDATE support_user SET socketid = ? WHERE id = ?', [socketId,  userId], function(err, results) {
       if(err)
          throw err;

        io.to(socketId).emit(event,{
                                    success:1,
                                    usrConnectedSocket: socketId,
                                    msg:message
                                  });

    });
}

function loginUser(socketId, data)
{
  pool.getConnection(function(err, connection) {
    if(err)
        throw err;
      connection.query("SELECT id,first_name FROM support_user WHERE email = " + mysql.escape(data.email) + "  LIMIT 1 " , function(err,row){
          if(err){
            throw err;
          }
          if(row.length > 0){
            updateUser(row[0].id, socketId, 'login-user', 'Login Success!', connection);                   
          }
          else{
            io.to(socketId).emit('login-user',{
                                      success:0,
                                      msg:'Invalid username or password'
                                    });
          }
      });
      connection.release();
  });
}


http.listen(port,function(){

	console.log('Listing on http://localhost:'+port);

});


//Express initializes app to be a function handler that you can supply to an HTTP server (as seen in line 2).
//We define a route handler / that gets called when we hit our website home.
//We make the http server listen on port 3000.