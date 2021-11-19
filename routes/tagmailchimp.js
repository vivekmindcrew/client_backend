var express = require('express');
var router = express.Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");
var asyncLoop = require('node-async-loop');
var cron = require('node-cron');
var axios = require('axios');
let async = require("async");
const { route } = require('./subscription');



router.post('/tagmailchimpadd',(req,res)=>{
  req.getConnection((err, conn) => {
        conn.query("SELECT * FROM users", async (err, result) => {
            if (err) {
                console.log(err);
                res.json({ "msg": "Error", "status": false })
            } else {
                if(result.length>0){
                  console.log("hello result",result);
                      

                }
             }
         })
     })
})



module.exports = router;
