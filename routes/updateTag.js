var express = require('express');
var router = express.Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");
var asyncLoop = require('node-async-loop');
var cron = require('node-cron');
var axios = require('axios');
let async = require("async");
const { route } = require('./subscription');



router.post('/getUserAndUpdate', (req, res) => {
  req.getConnection((err, conn) => {
    conn.query("SELECT * FROM users", async (err, result) => {
      if (err) {
        console.log(err);
        res.json({ "msg": "Error", "status": false })
      } else {
        if (result.length > 0) {
          async.eachSeries(result, function (resultdata, next) {

            mailchimp.setConfig({
              apiKey: resultdata.mailchimpApiKey,
              server: resultdata.mailchimpServer,
            });
            console.log("resultdataresultdataresultdata")

            mailchimp.lists.getListMembersInfo(resultdata.mailChimpAudienceId, { count: 1000 })
              .then(response => {
                async.eachSeries(response.members, function (resultdata1, next1) {
                  conn.query("select tag from leads where email='" + resultdata1.email_address + "' OR email2='" + resultdata1.email_address + "' OR email3='" + resultdata1.email_address + "'", (err, result1) => {

                    if (err) {
                      console.log("error", err);
                    } else {
                      if (result1.length > 0 && result1[0].tag !== null) {
                        var query1 = "SELECT tagid FROM tagtable WHERE userid='" + resultdata.id + "' AND tagName = '" + result1[0].tag + "';";
                        conn.query(query1, (err, dataresult1) => {
                          if (err) {
                            console.log(err);
                          } else {
                            if (dataresult1.length > 0) {
                              const listId = resultdata.mailChimpAudienceId;
                              const tagId = dataresult1[0].tagid; //tag table
                              const body = {
                                members_to_add: [resultdata1.email_address]  //resultdata1.email_address
                              };

                              mailchimp.lists.batchSegmentMembers(
                                body,
                                listId,
                                tagId
                              ).then((response) => {
                                console.log('hello', dataresult1[0].tagid, resultdata1.tags, resultdata1.email_address, resultdata.email)
                                next1()
                              }).catch((err) => {
                                console.log("errorororororo", dataresult1[0].tagid, resultdata1.tags, resultdata1.email_address, resultdata.email, err);
                                next1();
                              });

                            }
                            else {
                              const tag = {
                                name: result1[0].tag,
                                static_segment: [resultdata1.email_address]
                              };
                              const listId = resultdata.mailChimpAudienceId;
                              mailchimp.lists.createSegment(listId, tag)
                                .then((responsenew) => {

                                  console.log("responsenew", result1[0].tag, resultdata1.tags, resultdata1.email_address, resultdata.email)

                                  var query2 = "INSERT into tagtable(tagid,tagname,userid) values('" + responsenew.id + "','" + result1[0].tag + "','" + resultdata.id + "')"
                                  conn.query(query2, (err, dataresultnew1) => {
                                    if (err) {
                                      console.log(err);

                                    } else {
                                      console.log("data inserted successfully into tagtable", dataresultnew1)
                                    }
                                    next1()
                                  })

                                })
                                .catch((err) => {
                                  console.log("err", result1[0].tag, resultdata1.tags, resultdata1.email_address, resultdata.email)
                                  next1()
                                });



                            }

                          }
                        })


                      }

                      else {
                        next1();
                      }


                    }
                  })
                }, function (err) {3

                  if (err) {
                    console.error('Error: ' + err.message);
                  }
                  console.log('next call');
                  next();
                })
              })
              .catch((err) => {
                next();
              })
          });
        }
      }
    })
  })
})


module.exports = router;
















