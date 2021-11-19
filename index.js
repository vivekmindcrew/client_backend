const cors = require("cors");
var createError = require('http-errors');
var express = require('express');
path = require('path');
var port = process.env.PORT || 3308
var cookieParser = require('cookie-parser');
var bodyParser = require("body-parser");
var bcrypt = require('bcrypt');

const uuid = require("uuidv4");
require("dotenv").config();

const app = express();

const subscription = require('./routes/subscription');
const Users = require('./routes/Users');
const addMailchimpRouter = require('./routes/mailchimp');
const updateTag = require('./routes/updateTag');
const tagmailchimp = require('./routes/tagmailchimp');
const addcontact = require('./routes/cron');
const demo = require('./routes/demo');

var mysql = require('mysql'), // node-mysql module
    myConnection = require('express-myconnection'), // express-myconnection module
    // dbOptions = {
    //     host: '3.16.63.72',
    //     user: 'sandy-user',
    //     password: '4l#?3H1PhLYaJoHL0hu',
    //     database: 'sandy-db'
    // };
    //Mysql@127.0.0.1:3306
    // dbOptions = {
    //     host: "localhost",
    //     user: "root",
    //     password: "Mindcrew01~",
    //     database: 'sandy-db'
    // };
// var mysql = require('mysql'), // node-mysql module
//     myConnection = require('express-myconnection'), // express-myconnection module
    // dbOptions = {
    //     host:  'localhost',
    //     user: 'root',
    //     password: "",
    //     database: 'demodatabase'
    // };

     dbOptions = {
        host: "3.137.189.97",
        user: "client1",
        password: "root",
        //database: 'demodatabase'
         database: 'clientconnect'
    };

// var mysql = require('mysql'), // node-mysql module
//     myConnection = require('express-myconnection'), // express-myconnection module
//     dbOptions = {
//         host: '18.217.142.63',
//         user: 'sandy-user',
//         password: '4l#?3H1PhLYaJoHL0hu',
//         database: 'sandy-db'
//     };
app.use(myConnection(mysql, dbOptions));
//middleware

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})
app.use(express.static('public'));
//app.use(express.static('public'));

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

var query = "sleect";
var conn = "dfd";
var listId = "2dfffdf";

//routes
app.use('/subscription', subscription);
app.use('/login', Users);
app.use('/mailchimp', addMailchimpRouter);
app.use('/updatetag', updateTag);
app.use('/tagmailchimp', tagmailchimp);
app.use('/cron', addcontact);
app.use('/demo', demo);
// app.post('/stripe/listOfPlans', stripController.listOfPlans)

//listen

app.listen(port, () => console.log("Listening on port no. " + port));
module.exports = app;