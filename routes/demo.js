var express = require('express');
var router = express.Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");
var asyncLoop = require('node-async-loop');
var cron = require('node-cron');
var axios = require('axios');
let async = require("async");
const { route } = require('./subscription');
const JSONToCSV = require('json2csv').parse;
const FileSystem = require('fs');
const nodemailer = require('nodemailer');





router.post('/demo',(req,res)=>{
  req.getConnection((err, conn) => {
        let date = new Date().toISOString().slice(0, 10)
        let lastsevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        let lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        console.log("req.body",req.body)// which gives email2: 'JacksonWhite_Appstore', days: 7 
       
        
        // let y = 2;
        
        // if(y===1){

        //   cron.schedule('* * * * *', () => {
        //     console.log("cron by 11111");

        //   }, {
        //       scheduled: true,
        //       timezone: "America/New_York"
        //   })


        // }

        //  if(y===2){

        //   cron.schedule('* * * * *', () => {
        //     console.log("cron by 22222");

        //   }, {
        //       scheduled: true,
        //       timezone: "America/New_York"
        //   })


        // }

        //  if(y===3){

        //   cron.schedule('* * * * *', () => {
        //     console.log("cron by 3333");

        //   }, {
        //       scheduled: true,
        //       timezone: "America/New_York"
        //   })


        // }


        let dataday = req.body.days;

        var sql = "select countypractice from subscribedCounties where userid = '242' and isSubscribed = '1'";
        conn.query(sql,(err,result1)=>{
            if(err){
                console.log('err');
            }else{
                 const mailTransporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'developertest71296@gmail.com',
                        pass: 'developer@71296'
                    }
                 });
                let i = 0;
                
                if(dataday === 1){          

                    async.eachSeries(result1, function (resultdata, next) {        
                       
                       console.log(i,resultdata.countypractice)
                       
                       var sql = "select fn, ln, Charge, age, email, email2, email3, phone, date, county from leads where date = '"+date+"'  and county='"+resultdata.countypractice+"' and county in (select countypractice from subscribedCounties where userid='242' and isSubscribed = 1) ";
                       conn.query(sql, async (err,result)=>{
                        
                        if(err){
                          res.json({
                              msg:"this is error",err
                          })
                        }else{
                           
                           if(result.length>0){

                            console.log("result from else block",i,result)  
                            
                             
                             const csv = await JSONToCSV(result,{fields:["fn","ln","Charge","age","email","email2","email3","phone","date","county"]});
                             console.log(csv); 
                             FileSystem.writeFileSync(`./csvFiles/currentday/currentdaysource${i}.csv`,csv);

                               let mailDetails = {
                                    from: 'developertest71296@gmail.com',
                                    to: req.body.email2,
                                    subject: 'Leads email',
                                    text: `leads for ${resultdata.countypractice} at today`,
                                    attachments: [{
                                            filename: `currentdaysource${i}.csv`,
                                            path: `./csvFiles/currentday/currentdaysource${i}.csv` // stream this file
                                        }]
                                 };
                                  
                                 mailTransporter.sendMail(mailDetails, function(err, data) {
                                    if(err) {
                                        console.log('Error Occurs',err);
                                    } else {
                                        console.log('Email sent successfully');
                                    }
                                 });

                            i++;
                          
                           }
                       
                           next();
                        }

                       })

                   })                    

                }                         
    
                 if(dataday === 7){        

                    async.eachSeries(result1, function (resultdata, next) {        
                       
                       console.log(i,resultdata.countypractice)
                       
                      var sql = "select fn, ln, Charge, age, email, email2, email3, phone, date, county from leads where date > '"+lastsevenDays+"' and date<='" + date +"' and county='"+resultdata.countypractice+"' and county in (select countypractice from subscribedCounties where userid='242' and isSubscribed = 1) ";
                       conn.query(sql, async (err,result)=>{
                        
                        if(err){
                          res.json({
                              msg:"this is error",err
                          })
                        }else{
                           
                           if(result.length>0){

                            console.log("result from else block",i,result)  
                            
                             
                             const csv = await JSONToCSV(result,{fields:["fn","ln","Charge","age","email","email2","email3","phone","date","county"]});
                             console.log(csv); 
                             FileSystem.writeFileSync(`./csvFiles/last7days/last7daysource${i}.csv`,csv);

                               let mailDetails = {
                                    from: 'developertest71296@gmail.com',
                                    to: req.body.email2,
                                    subject: 'Leads email',
                                    text: `leads for ${resultdata.countypractice} in last 7 days`,
                                    attachments: [{
                                            filename: `last7daysource${i}.csv`,
                                            path: `./csvFiles/last7days/last7daysource${i}.csv` // stream this file
                                        }]
                                 };
                                  
                                 mailTransporter.sendMail(mailDetails, function(err, data) {
                                    if(err) {
                                        console.log('Error Occurs',err);
                                    } else {
                                        console.log('Email sent successfully');
                                    }
                                 });

                            i++;
                          
                           }
                    
                           next();
                        }

                       })

                   })                     

                }                        

             
               if(dataday === 30){          

                    async.eachSeries(result1, function (resultdata, next) {       
                       
                       console.log(i,resultdata.countypractice)
                       
                      var sql = "select fn, ln, Charge, age, email, email2, email3, phone, date, county from leads where date>'" + lastMonth + "' and date<='" + date +"' and county='"+resultdata.countypractice+"' and county in (select countypractice from subscribedCounties where userid='242' and isSubscribed = 1) ";
                       conn.query(sql, async (err,result)=>{
                        
                        if(err){
                          res.json({
                              msg:"this is error",err
                          })
                        }else{
                           
                           if(result.length>0){

                            console.log("result from else block",i,result)  
                            
                             
                             const csv = await JSONToCSV(result,{fields:["fn","ln","Charge","age","email","email2","email3","phone","date","county"]});
                             console.log(csv); 
                             FileSystem.writeFileSync(`./csvFiles/last30days/last30daysource${i}.csv`,csv);

                               let mailDetails = {
                                    from: 'developertest71296@gmail.com',
                                    to: req.body.email2,
                                    subject: 'Leads email',
                                    text: `leads for ${resultdata.countypractice} in last 30 days`,
                                    attachments: [{
                                            filename: `last30daysource${i}.csv`,
                                            path: `./csvFiles/last30days/last30daysource${i}.csv` // stream this file
                                        }]
                                 };
                                  
                                 mailTransporter.sendMail(mailDetails, function(err, data) {
                                    if(err) {
                                        console.log('Error Occurs',err);
                                    } else {
                                        console.log('Email sent successfully');
                                    }
                                 });

                            i++;
                          
                           }
                     
                           next();
                        }

                       })

                   })                   

                }                        

                res.json({
                    msg:"datatatatatatatat"
                })
            }
        })

     })
})



module.exports = router;
