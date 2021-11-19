var express = require('express');
var router = express.Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");
var asyncLoop = require('node-async-loop');
var cron = require('node-cron');
var axios = require('axios');
let async = require("async");
const { route } = require('./subscription');

// cron.schedule('* * * * *', () => {
//     // var dateNow = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
//     console.log("cron");

//     axios.post('http://3.137.189.97:3308/cron/addContact')
//         .then(response => {
//             console.log("Ssccessfull!!!!!!!!!!!!!!!!", response.data.status);
//             if (response.data.status === true) {
//                 axios.post('http://3.137.189.97:3308/cron/updateSynced')
//                     .then(response => {
//                         console.log("Ssccessfullly Update sync variable", response.data);
//                     })
//                     .catch(error => {
//                         console.log(error);
//                     })
//                 console.log("synced")
//             }
//         })
//         .catch(error => {
//             console.log(error);
//         })

// }, {
//     scheduled: true,
//     timezone: "America/New_York"
// })

router.post('/addContact', function (req, res) {

    let oneDay = new Date(Date.now()).toISOString().slice(0, 10);
    console.log(oneDay, "dsfsd");
    var arrDate = [];
    try {
        console.log("........Contact........");
        var count = 1;
        req.getConnection((err, conn) => {
 
            // SELECT * FROM leads WHERE isSynced = 1 AND DATE >= (SELECT mailchimpKeyDate FROM usersCopy WHERE id =  122) AND county IN (SELECT countypractice FROM subscribedCountiesCopy WHERE userid=122 AND isSubscribed = 1);
            var query = "SELECT a1.*, a2.id, a2.username, a2.mailchimpApiKey, a2.mailchimpServer, a2.mailChimpAudienceId, a3.countypractice FROM leads a1, users a2, subscribedCounties a3 WHERE a1.isSynced=0 AND a1.date >= a2.mailchimpKeyDate AND a1.county = a3.countypractice AND a3.isSubscribed =1 AND a2.id = a3.userid;"

            conn.query(query, (err, leadRes) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("lead Length", leadRes.length);
                     console.log("lead Length", leadRes);
                    var len = leadRes.length;
                    if (len > 0) {
                       
                        // console.log("Middle loopppppppppppp", leadRes.length);
                        async.eachSeries(leadRes, function (leadElement, next1) {
                            // console.log(leadElement)
                            mailchimp.setConfig({
                                apiKey: leadElement.mailchimpApiKey,
                                server: leadElement.mailchimpServer
                            });
                            // console.log("Lead", leadElement.fn, leadElement.county, leadElement.countypractice );
                            var emailArr = [];
                            if (leadElement.email !== null && leadElement.email !== "" && leadElement.email !== "(null)") {
                                emailArr.push(leadElement.email);
                            }
                            if (leadElement.email2 !== null && leadElement.email2 !== "" && leadElement.email !== "(null)") {
                                emailArr.push(leadElement.email2);
                            }
                            if (leadElement.email3 !== null && leadElement.email3 !== "" && leadElement.email !== "(null)") {
                                emailArr.push(leadElement.email3);
                            }
                            async.eachSeries(emailArr, function (emailElement, next) {
                                console.log(emailElement, leadElement.county, leadElement.countypractice, leadElement.id);

                                console.log("Count", count);
                                count++;
                                mailchimp.lists.addListMember(leadElement.mailChimpAudienceId, {
                                    email_address: emailElement,
                                    status: "subscribed",
                                    merge_fields: {
                                        FNAME: leadElement.fn,
                                        LNAME: leadElement.ln,
                                        PHONE: leadElement.phone,
                                        CHARGE: leadElement.Charge,
                                        COUNTY: leadElement.county
                                        
                                    },
                                }).then((response) => {
                                    console.log("Email Added", emailElement, leadElement.id);

                                     
                                    // console.log("qqqqqqqqqq",leadElement)
                                    // console.log("leadElement.id",leadElement.id)
                                     console.log("leadElement.tag#############",leadElement.tag,leadElement.email,leadElement.email2,leadElement.email3)
                                       var query1 = "SELECT tagid FROM tagtable WHERE userid='" + leadElement.id + "' AND tagName = '" + leadElement.tag + "';";
                                      
                                       conn.query(query1,(err,dataresult1)=>{
                                         if(err){
                                          console.log(err);
                                          return res.json({
                                            msg:'something went wrong',
                                            error:err
                                          })
                                         }else{
                                            // console.log(" line 109 dataresult1",dataresult1[0].tagid)
                                            if (dataresult1.length > 0) {
                                                
                                                
                                                const listId = leadElement.mailChimpAudienceId;
                                                const tagId = dataresult1[0].tagid; //tag table
                                                const body = {
                                                    members_to_add: [leadElement.email,leadElement.email2,leadElement.email3]  
                                                };

                                                mailchimp.lists.batchSegmentMembers(
                                                    body,
                                                    listId,
                                                    tagId
                                                ).then((response) =>{
                                                    console.log('hello')
                                                    next();
                                                })
                                                    .catch((err) => {
                                                        console.log("errorororororo")
                                                        next();
                                                    });
 
                                             }
                                                 else {
                                                  
                                                      const tag = {
                                                          name: leadElement.tag,
                                                          static_segment: [leadElement.email,leadElement.email2,leadElement.email3]  // create new tag if not exist in database in mailchimp
                                                      };
                                                     
                                                      const listId = leadElement.mailChimpAudienceId;
                                                      mailchimp.lists.createSegment(listId, tag)
                                                          .then((responsenew) => {

                                                           console.log("line 134 responsenew",responsenew)
                                                            
                                                            var query2 = "INSERT into tagtable(tagid,tagname,userid) values('"+responsenew.id+"','"+leadElement.tag+"','"+leadElement.id+"')"
                                                            conn.query(query2,(err,dataresultnew1)=>{
                                                              if(err){
                                                                console.log(err);
                        
                                                              }else{
                                                                console.log("data inserted successfully into tagtable",dataresultnew1)
                                                              }
                                                            })
                                                             next();
                                                          })
                                                          .catch((err) => {
                                                            console.log("err",err);
                                                            next();
                                                          });
                                                 
                                                    
                                              
                                              }
                                         }
                                       })











                                  
                                }).catch((err) => {
                                    if (err.status === 400) {
                                        console.log( "Email Already Synced");
                                        next();
                                    } else {
                                        console.log("Email Rejected................................................", emailElement, leadElement.id);
                                next();
                                    }
                                });

                            }, function (err) {
                                if (err) {
                                    console.error('Error: ' + err.message);
                                } else {
                                    // console.log("middle count", middleCount);

                                }
                                next1();
                            });
                        }, function (err) {
                            if (err) {
                                console.error('Error: ' + err.message);
                            } else {
                                console.log("All synced")
                                res.json({ status: true, msg: 'synced' });
                            }
                        });
                    } else {
                        console.log("No new lead found.");
                        res.json({ status: true, msg: 'no lead found' })
                    }
                }
            })

        });
    }
    catch (err) {
        // res.json({
        //     "err": err,
        //     "msg": "something is wrong"
        // })
    }
});

router.post('/updateSynced', function (req, res, next) {
    try {
        console.log("........Update Sync........");
        req.getConnection((err, conn) => {
            conn.query("UPDATE leads SET isSynced = 1 WHERE isSynced = 0;", (err, userResult) => {
                if (err) {
                    console.log(err);
                    res.json({ "msg": "Error", "status": false });
                } else {
                    console.log("synccc")
                    res.json({ "msg": "Update", "status": true });
                }
            })
        })
    } catch {
        res.json({ "msg": "Error", "status": false })
    }
})

router.get('/demooo', function (req, res) {
    // mailchimp.setConfig({
    //     apiKey: "c191ef1ef4a38c6af683ee75dcf40f08",
    //     server: "us1",
    //   });

    //   const run = async () => {
    //     const response = await mailchimp.lists.getListMembersInfo("59c7a66368", {count:1000}); 
    //     // console.log(response)
    //     response.members.map((c)=>{
    //     console.log(c.merge_fields.COUNTY, c.timestamp_opt)
    //         })
    //   };

    //   run()
    mailchimp.setConfig({
        apiKey: "93387a00997bb25c8e7868377791f6fb",
        server: "us1",
    });

    const run = async () => {
        const response = await mailchimp.lists.getListMembersInfo("4af7811272", { count: 1000 });
        console.log(response)
        response.members.map((c) => {
            console.log(c.merge_fields.COUNTY, c.timestamp_opt)
        })
    };

    run()
})


module.exports = router;