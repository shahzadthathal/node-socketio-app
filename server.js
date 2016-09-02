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

      socket.on('register',function(data){
        var user = {
                    first_name: data.first_name,
                    email:      data.email,
                    socketid:   socket.id
                  };
        var userMessage = {
                    message: data.message
        };  
          pool.getConnection(function(err, connection) {    
           connection.query("SELECT id FROM support_user WHERE email = " + mysql.escape(user.email) + " LIMIT 1 " , function(err,row){
            if(err){
              console.log(err);
            }
            if(row.length > 0){
              console.log('already register',row[0].id);          
              userMessage.sender_id = row[0].id;
              connection.query("UPDATE support_user SET socketid = :socketid", { socketid: user.socketid },function(errr, result){
                  if(err)
                    console.log(err);

                  var query2 = connection.query('Insert into support_message set ?', userMessage, function(err,result){
                     io.to(user.socketid).emit('register',{
                                        success:1,
                                        msg:userMessage.message,
                                        usrConnectedSocket:user.socketid
                                      });
                  });
              });          
            }
            else{
                  var query = connection.query('INSERT INTO support_user SET ?', user, function(err, result) {
                    if (err) 
                      console.log(err);

                      userMessage.sender_id = result.insertId;
                      var query2 = connection.query('Insert into support_message set ?', userMessage, function(err,result){              
                         io.to(user.socketid).emit('register',{
                                          success:1,
                                          msg:userMessage.message,
                                          usrConnectedSocket:user.socketid
                                        });
                      })
                  });
                 io.to(data.usrConnectedSocket).emit('register',{success:0});           
            }
           });
           connection.release();
         });
          io.to(data.usrConnectedSocket).emit('register',{success:0}); 
      });


      socket.on('support-message', function(data){
         var res = {
                      msg:data.msg
                    };
         io.to(data.usrConnectedSocket).emit('support-message',res);

      });

      socket.on('login-user', funciton(data){
        loginUser(socket.id,data);
      });

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

});

function checkUniqueEmail(email)
{
  pool.getConnection(function(err, connection) {
    if(err)
        throw err;
       connection.query("SELECT id FROM support_user WHERE email = " + mysql.escape(email) + " LIMIT 1 " , function(err,row){
        if(err){
          console.log(err);
        }
        if(row.length > 0){
          return row[0].id;
        }
        else{
          return false;
        }
      });
      connection.release();
  });
}
function registerUser(socketId, data)
{
  pool.getConnection(function(err, connection) {
    if(err)
        throw err;
      connection.query('INSERT INTO support_user SET ?', user, function(err, result) {
                     io.to(user.socketid).emit('register',{
                                        success:1,
                                        msg:userMessage.message,
                                        usrConnectedSocket:user.socketid
                                      });
      });
      connection.release();
  });
}

function updateUser(userId,socketId)
{
  pool.getConnection(function(err, connection) {
      if(err)
        throw err;

      connection.query('UPDATE support_user SET socketid = ? WHERE id = ?', [socketId,  userId], function(err, results) {
         if(err)
            throw err;

      });
      connection.release();
  }); 
}

function loginUser(socketId, data)
{
  pool.getConnection(function(err, connection) {
    if(err)
        throw err;
      connection.query("SELECT id,first_name FROM support_user WHERE email = " + mysql.escape(data.email) + " And password = " + mysql.escape(data.password) + " LIMIT 1 " , function(err,row){
          if(err){
            throw err;
          }
          if(row.length > 0){
            updateUser(row[0].id,socketId);                   
          }
          else{
            io.to(user.socketid).emit('register',{
                                      success:0,
                                      msg:'Invalid username or password'
                                    });
          }
      });
      connection.release();
  });
}

function insertMessage(event,socketId,messageObjec)
{
  pool.getConnection(function(err, connection) {
    if(err)
      throw err;
      connection.query('Insert into support_message set ?', messageObjec, function(err,result){ 
       if(err)
        throw err;           
          io.to(socketId).emit(event,{
                        success:1,
                        msg:messageObjec.message,
                        usrConnectedSocket:user.socketId
                      });
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