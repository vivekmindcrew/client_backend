const express = require('express'),
  app = express(),
  bodyParser = require('body-parser');
  port = process.env.PORT || 3308;


const mysql = require('mysql');
// connection configurations
// const mc = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'sandy-user'
// });






// var con = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     password: "",
//     //database: 'demodatabase'
//      database: 'clientconnect'
//   });
var con = mysql.createConnection({
    host: "3.137.189.97",
    user: "client1",
    password: "root",
    //database: 'demodatabase'
     database: 'clientconnect'
  });
  
  
  con.connect(function(err) {
    if (err) {
        console.log(err);
    }
    else{
       console.log("Connected!"); 
    }
    
  });
  
 
// connect to database
// mc.connect();

app.listen(port);

console.log('API server started on: ' + port);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// var routes = require('./app/routes/approutes'); //importing route
// routes(app); //register the route