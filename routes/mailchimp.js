
var express = require('express');
var router = express.Router();
const mailchimp = require("@mailchimp/mailchimp_marketing");
var asyncLoop = require('node-async-loop');
var cron = require('node-cron');
var axios = require('axios');
let async = require("async");
const { route } = require('./subscription');
const fs = require('fs');
const multer = require('multer');
const { base64_encode, uploadImageOnMailChimp, uploadedImageOnMailChimpList } = require('../helpers/utilities')


const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './public/upload/')
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({ storage: storage }).any();
 

router.post('/addAudience', function (req, res) {
    let apiKeyDate = new Date(Date.now()).toISOString().slice(0, 10);
    console.log("Audience", apiKeyDate, req.body.userId);
    var userId = req.body.userId;
    var arr = [];
    arr = req.body.mailchimpId.split('-');
    try {

        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM users where id = '" + userId + "';", (err, firstresult) => {
                if (err) {
                    console.log(err);
                    res.json({ "msg": "Error", "status": false })
                } else {
                    console.log("1", firstresult);
                    if (firstresult[0].email !== null) {
                        console.log("2");
                        conn.query("UPDATE users SET mailchimpApiKey = '" + arr[0] + "', mailchimpServer = '" + arr[1] +
                            "', mailchimpKeyDate = '" + apiKeyDate + "' WHERE id = '" + userId + "';", (err, data) => {
                                if (err) {
                                    console.log(err);
                                    res.json({ "msg": "Error", "status": false })
                                } else {
                                    conn.query("SELECT * FROM users WHERE id = '" + userId + "';", (err, result) => {
                                        if (err) {
                                            console.log(err);
                                            res.json({ "msg": "Error", "status": false })
                                        } else {

                                            mailchimp.setConfig({
                                                apiKey: result[0].mailchimpApiKey,
                                                server: result[0].mailchimpServer
                                            });
                                            console.log(result[0].mailchimpServer, "setconfig", result[0].mailchimpApiKey);

                                            mailchimp.lists.getAllLists().then((response) => {
                                                console.log("sdafdfsdfd", response.lists[0].name, "bhjbjhjkjb");
                                                if (response.lists[0].name !== "Client Connect Auto-Upload") {
                                                    mailchimp.lists.updateList(response.lists[0].id, {
                                                        name: "Client Connect Auto-Upload",
                                                    })
                                                    // console.log("list");
                                                }
                                                conn.query("UPDATE users  SET mailChimpAudienceId = '"
                                                    + response.lists[0].id + "' WHERE id = '" + userId + "';", (err, updateresult) => {
                                                        if (err) {
                                                            console.log(err);
                                                            res.json({ "msg": "Error", "status": false })
                                                        } else {
                                                            console.log("Mailchamp API Key and Audience Id Inserted, audience created");
                                                            mailchimp.lists.addListMergeField(response.lists[0].id, {
                                                                name: "Charge",
                                                                type: "text",
                                                                tag: "CHARGE",
                                                                public: true
                                                            }).then((chargeresult) => {
                                                                console.log(chargeresult);
                                                                mailchimp.lists.addListMergeField(response.lists[0].id, {
                                                                    name: "County",
                                                                    type: "text",
                                                                    tag: "COUNTY",
                                                                    public: true
                                                                }).then((fieldresult) => {
                                                                    console.log("fieldresult");
                                                                    var mailchimpApiKey = result[0].mailchimpApiKey;
                                                                    var mailchimpServer = result[0].mailchimpServer;

                                                                    var query = "SELECT * FROM leads WHERE county IN (select countypractice from subscribedCounties where userid='"
                                                                        + userId + "'and isSubscribed = 1) and date >= (SELECT mailchimpKeyDate FROM users where id = '" + userId + "');"
                                                                    fetchLead(query, conn, response.lists[0].id, mailchimpApiKey, mailchimpServer).then((fetchresult) => {
                                                                        console.log("Lead synced on adding contact", fetchresult);
                                                                    });
                                                                    res.json({ "status": true, data: response, "msg": "Mailchamp API Key and Audience Id Inserted, audience created" });
                                                                }).catch((err) => {
                                                                    console.log(err);
                                                                    conn.query("UPDATE users SET mailchimpApiKey = '(NULL)', mailchimpServer = '(NULL)', mailchimpKeyDate = (NULL), mailChimpAudienceId = '(NULL)' WHERE id = '" + req.body.userId + "';", (err, data) => {
                                                                        if (err) {
                                                                            console.log(err);
                                                                            res.json({ "msg": "Error", "status": false })
                                                                        } else {
                                                                            // console.log("err - API KEY Inserted but audience creation failed. Please check your API KEY");
                                                                            res.json({ "msg": "API KEY Inserted but audience creation failed. Please check your API KEY", "status": false });
                                                                        }
                                                                    });
                                                                });
                                                            }).catch((err) => {
                                                                console.log(err);
                                                                conn.query("UPDATE users SET mailchimpApiKey = '(NULL)', mailchimpServer = '(NULL)', mailchimpKeyDate = (NULL), mailChimpAudienceId = '(NULL)' WHERE id = '" + req.body.userId + "';", (err, data) => {
                                                                    if (err) {
                                                                        console.log(err);
                                                                        res.json({ "msg": "Error", "status": false })
                                                                    } else { 
                                                                        // console.log("err - API KEY Inserted but audience creation failed. Please check your API KEY");
                                                                        res.json({ "msg": "API KEY Inserted but audience creation failed. Please check your API KEY", "status": false });
                                                                    }
                                                                });
                                                            });


                                                        }
                                                    })
                                            }).catch((err) => {
                                                conn.query("UPDATE users SET mailchimpApiKey = '(NULL)', mailchimpServer = '(NULL)', mailchimpKeyDate = (NULL), mailChimpAudienceId = '(NULL)' WHERE id = '" + req.body.userId + "';", (err, data) => {
                                                    if (err) {
                                                        console.log(err);
                                                        res.json({ "msg": "Error", "status": false })
                                                    } else {

                                                        // console.log("err - API KEY Inserted but audience creation failed. Please check your API KEY");
                                                        res.json({ "msg": "API KEY Inserted but audience creation failed. Please check your API KEY", "status": false });
                                                    }
                                                });
                                            })
                                        }
                                    })
                                }
                            })
                    }

                    else {
                        // console.log("user not found");
                        res.json({ "msg": "User not found", "status": false })
                    }
                }
            })
        });
    } catch (err) {
        console.log(err);
        res.json({
            "err": err,
            "msg": "something is wrong"
        });
    }
})
 

async function fetchLead(query, conn, listId, mailchimpApiKey, mailchimpServer) {
    mailchimp.setConfig({
        apiKey: mailchimpApiKey,
        server: mailchimpServer
    });
    conn.query(query, (err, leadRes) => {
        if (err) {
            console.log(err);
        } else {

            // console.log("lead Length", leadRes.length);
            var len = leadRes.length;
            if (len > 0) {
                // console.log("Middle loopppppppppppp", leadRes.length);
                asyncLoop(leadRes, function (leadElement, next) {
                    console.log("Lead", leadElement.fn, leadElement.county);
                    var emailArr = [];
                    if (leadElement.email !== null && leadElement.email !== "") {
                        emailArr.push(leadElement.email);
                    }
                    if (leadElement.email2 !== null && leadElement.email2 !== "") {
                        emailArr.push(leadElement.email2);
                    }
                    if (leadElement.email3 !== null && leadElement.email3 !== "") {
                        emailArr.push(leadElement.email3);
                    }
                    console.log("Inneeerrrrrr looopppppppp", emailArr.length);
                    asyncLoop(emailArr, function (emailElement, next) {
                        mailchimp.lists.addListMember(listId, {
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
                            console.log("Email Added", emailElement);
                            next();
                        }).catch((err) => {
                            if (err.status === 400) {
                                console.log(leadElement.fn, "Email Already Synced", emailElement);
                                next();
                            } else {
                                console.log("Email Rejected................................................", emailElement, mailchimpApiKey);
                                next();
                            }
                        });
                    }, function (err) {
                        if (err) {
                            console.error('Error: ' + err.message);
                        } else {
                            // console.log("middle count", middleCount);

                        }
                        next();
                    });
                }, function (err) {

                    if (err) {
                        console.error('Error: ' + err.message);
                    }
                    return;
                });
            } else {
                console.log("No new lead found.");
                return;
            }
        }
    })
};
 
router.get('/deleteUnsubscribed', function (req, res) {
    var listId;
    try {
        console.log("deleted", req.query.emailId);

        req.getConnection((err, conn) => {
            conn.query("DELETE FROM leads WHERE email = '" + req.query.emailId +
                "';", (err, deleteResponse) => {
                    if (err) {
                        // console.log(err);
                        res.redirect('https://www.clientconnect.ai/opt-out/');
                    } else {
                        // console.log("sucessfully deleted"); 
                        res.redirect('https://www.clientconnect.ai/opt-out/');

                    }
                })
        })
    }
    catch (err) {
        console.log(err);
    }
})

router.post('/addTemplatenew',upload,function (req, res) {
    req.getConnection((err, conn) => {
   
        conn.query("SELECT * FROM users WHERE id = '" + req.body.userId + "';", async (err, result) => {
            if (err) {
                console.log(err);
                res.json({ "msg": "Error", "status": false })
            } else {
               //console.log("req.files",req.files[0])
               console.log('req.bodyyyyyyyyyyyyyyyyyyyy',req.body)
                let base64IMG = base64_encode(path.join(__dirname, `../public/upload/${req.files[0].filename}`))

                let imageExt = req.files[0].mimetype.split("/")[1];

                let imageResponse = await uploadImageOnMailChimp(base64IMG, imageExt, { apiKey: result[0].mailchimpApiKey, server: result[0].mailchimpServer });
                 console.log("imageResponse", imageResponse)
                let listOfAll = await uploadedImageOnMailChimpList({ apiKey: result[0].mailchimpApiKey, server: result[0].mailchimpServer });
                 console.log("listOfAll", listOfAll);
                
                // console.log("hello this is result",result[0]);
                if(result.length>0){

                        mailchimp.setConfig({
                            apiKey: result[0].mailchimpApiKey,
                            server: result[0].mailchimpServer
                        });

                              const response = await mailchimp.templates.create({
                                name: "Sample Solicitation",
                                html: ` <!doctype html>
                     <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                         <head>
                             <!-- NAME: SELL PRODUCTS -->
                             <!--[if gte mso 15]>
                             <xml>
                                 <o:OfficeDocumentSettings>
                                 <o:AllowPNG/>
                                 <o:PixelsPerInch>96</o:PixelsPerInch>
                                 </o:OfficeDocumentSettings>
                             </xml>
                             <![endif]-->
                             <meta charset="UTF-8">
                             <meta http-equiv="X-UA-Compatible" content="IE=edge">
                             <meta name="viewport" content="width=device-width, initial-scale=1">
                             <title>*|MC:SUBJECT|*</title>
                             
                         <style type="text/css">
                             p{
                                 margin:10px 0;
                                 padding:0;
                             }
                             table{
                                 border-collapse:collapse;
                             }
                             h1,h2,h3,h4,h5,h6{
                                 display:block;
                                 margin:0;
                                 padding:0;
                             }
                             img,a img{
                                 border:0;
                                 height:auto;
                                 outline:none;
                                 text-decoration:none;
                             }
                             body,#bodyTable,#bodyCell{
                                 height:100%;
                                 margin:0;
                                 padding:0;
                                 width:100%;
                             }
                             .mcnPreviewText{
                                 display:none !important;
                             }
                             #outlook a{
                                 padding:0;
                             }
                             img{
                                 -ms-interpolation-mode:bicubic;
                             }
                             table{
                                 mso-table-lspace:0pt;
                                 mso-table-rspace:0pt;
                             }
                             .ReadMsgBody{
                                 width:100%;
                             }
                             .ExternalClass{
                                 width:100%;
                             }
                             p,a,li,td,blockquote{
                                 mso-line-height-rule:exactly;
                             }
                             a[href^=tel],a[href^=sms]{
                                 color:inherit;
                                 cursor:default;
                                 text-decoration:none;
                             }
                             p,a,li,td,body,table,blockquote{
                                 -ms-text-size-adjust:100%;
                                 -webkit-text-size-adjust:100%;
                             }
                             .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
                                 line-height:100%;
                             }
                             a[x-apple-data-detectors]{
                                 color:inherit !important;
                                 text-decoration:none !important;
                                 font-size:inherit !important;
                                 font-family:inherit !important;
                                 font-weight:inherit !important;
                                 line-height:inherit !important;
                             }
                             .templateContainer{
                                 max-width:600px !important;
                             }
                             a.mcnButton{
                                 display:block;
                             }
                             .mcnImage,.mcnRetinaImage{
                                 vertical-align:bottom;
                             }
                             .mcnTextContent{
                                 word-break:break-word;
                             }
                             .mcnTextContent img{
                                 height:auto !important;
                             }
                             .mcnDividerBlock{
                                 table-layout:fixed !important;
                             }
                         /*
                         @tab Page
                         @section Heading 1
                         @style heading 1
                         */
                             h1{
                                 /*@editable*/color:#222222;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:40px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:center;
                             }
                         /*
                         @tab Page
                         @section Heading 2
                         @style heading 2
                         */
                             h2{
                                 /*@editable*/color:#222222;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:34px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Page
                         @section Heading 3
                         @style heading 3
                         */
                             h3{
                                 /*@editable*/color:#444444;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:22px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Page
                         @section Heading 4
                         @style heading 4
                         */
                             h4{
                                 /*@editable*/color:#949494;
                                 /*@editable*/font-family:Georgia;
                                 /*@editable*/font-size:20px;
                                 /*@editable*/font-style:italic;
                                 /*@editable*/font-weight:normal;
                                 /*@editable*/line-height:125%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Header
                         @section Header Container Style
                         */
                             #templateHeader{
                                 /*@editable*/background-color:#eeeeee;
                                 /*@editable*/background-image:none;
                                 /*@editable*/background-repeat:no-repeat;
                                 /*@editable*/background-position:center;
                                 /*@editable*/background-size:cover;
                                 /*@editable*/border-top:0;
                                 /*@editable*/border-bottom:0;
                                 /*@editable*/padding-top:12px;
                                 /*@editable*/padding-bottom:12px;
                             }
                         /*
                         @tab Header
                         @section Header Interior Style
                         */
                             .headerContainer{
                                 /*@editable*/background-color:transparent;
                                 /*@editable*/background-image:none;
                                 /*@editable*/background-repeat:no-repeat;
                                 /*@editable*/background-position:center;
                                 /*@editable*/background-size:cover;
                                 /*@editable*/border-top:0;
                                 /*@editable*/border-bottom:0;
                                 /*@editable*/padding-top:0;
                                 /*@editable*/padding-bottom:0;
                             }
                         /*
                         @tab Header
                         @section Header Text
                         */
                             .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
                                 /*@editable*/color:#757575;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:16px;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Header
                         @section Header Link
                         */
                             .headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{
                                 /*@editable*/color:#007C89;
                                 /*@editable*/font-weight:normal;
                                 /*@editable*/text-decoration:underline;
                             }
                         /*
                         @tab Body
                         @section Body Container Style
                         */
                             #templateBody{
                                  /*@editable*/background-color:#FFFFFF;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:12px;
                                  /*@editable*/padding-bottom:12px;
                              }
                          /*
                          @tab Body
                          @section Body Interior Style
                          */
                              .bodyContainer{
                                  /*@editable*/background-color:transparent;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0;
                                  /*@editable*/padding-bottom:0;
                              }
                          /*
                          @tab Body
                          @section Body Text
                          */
                              .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
                                  /*@editable*/color:#757575;
                                  /*@editable*/font-family:Helvetica;
                                  /*@editable*/font-size:16px;
                                  /*@editable*/line-height:150%;
                                  /*@editable*/text-align:left;
                              }
                          /*
                          @tab Body
                          @section Body Link
                          */
                              .bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{
                                  /*@editable*/color:#007C89;
                                  /*@editable*/font-weight:normal;
                                  /*@editable*/text-decoration:underline;
                              }
                          /*
                          @tab Footer
                          @section Footer Style
                          */
                              #templateFooter{
                                  /*@editable*/background-color:#eeeeee;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0px;
                                  /*@editable*/padding-bottom:0px;
                              }
                          /*
                          @tab Footer
                          @section Footer Interior Style
                          */
                              .footerContainer{
                                  /*@editable*/background-color:transparent;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0;
                                  /*@editable*/padding-bottom:0;
                              }
                          /*
                          @tab Footer
                          @section Footer Text
                          */
                              .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
                                  /*@editable*/color:#FFFFFF;
                                  /*@editable*/font-family:Helvetica;
                                  /*@editable*/font-size:12px;
                                  /*@editable*/line-height:150%;
                                  /*@editable*/text-align:center;
                              }
                          /*
                          @tab Footer
                          @section Footer Link
                          */
                              .footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{
                                  /*@editable*/color:#FFFFFF;
                                  /*@editable*/font-weight:normal;
                                  /*@editable*/text-decoration:underline;
                              }
                          @media only screen and (min-width:768px){
                              .templateContainer{
                                  width:600px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              body,table,td,p,a,li,blockquote{
                                  -webkit-text-size-adjust:none !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              body{
                                  width:100% !important;
                                  min-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnRetinaImage{
                                  max-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImage{
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
                                  max-width:100% !important;
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnBoxedTextContentContainer{
                                  min-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupContent{
                                  padding:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
                                  padding-top:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
                                  padding-top:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardBottomImageContent{
                                  padding-bottom:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupBlockInner{
                                  padding-top:0 !important;
                                  padding-bottom:0 !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupBlockOuter{
                                  padding-top:9px !important;
                                  padding-bottom:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnTextContent,.mcnBoxedTextContentColumn{
                                  padding-right:18px !important;
                                  padding-left:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
                                  padding-right:18px !important;
                                  padding-bottom:0 !important;
                                  padding-left:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcpreview-image-uploader{
                                  display:none !important;
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 1
                          @tip Make the first-level headings larger in size for better readability on small screens.
                          */
                              h1{
                                  /*@editable*/font-size:30px !important;
                                  /*@editable*/line-height:125% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 2
                          @tip Make the second-level headings larger in size for better readability on small screens.
                          */
                              h2{
                                  /*@editable*/font-size:26px !important;
                                  /*@editable*/line-height:125% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 3
                          @tip Make the third-level headings larger in size for better readability on small screens.
                          */
                              h3{
                                  /*@editable*/font-size:20px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 4
                          @tip Make the fourth-level headings larger in size for better readability on small screens.
                          */
                              h4{
                                  /*@editable*/font-size:18px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Boxed Text
                          @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                          */
                              .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
                                  /*@editable*/font-size:14px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Header Text
                          @tip Make the header text larger in size for better readability on small screens.
                          */
                              .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
                                  /*@editable*/font-size:16px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Body Text
                          @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                          */
                              .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
                                  /*@editable*/font-size:16px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Footer Text
                          @tip Make the footer content text larger in size for better readability on small screens.
                          */
                              .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
                                  /*@editable*/font-size:14px !important;
                                  /*@editable*/line-height:150% !important;
                              }

               





                     
                      }
                   @media only screen and (min-width: 0px) and (max-width: 320px){

                   .abc{
                      width:auto !important;
                      min-height: 50px !important;
                      max-height: 50px!important;
                     }
                     .contentoneto9{
                      font-size: 13px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }

                   @media screen and (min-width: 321px) and (max-width: 575px) {
  
                      .abc{
                      width:auto !important;
                      min-height: 70px !important;
                      max-height: 70px!important;
                      
                     }
                     
                     .contentoneto9{
                      font-size: 13px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }


                   }
                    @media screen and (min-width: 576px) and (max-width: 700px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 80px !important;
                      max-height: 80px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }
                    @media screen and (min-width: 701px) and (max-width: 832px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 90px !important;
                      max-height: 90px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }
                   @media screen and (min-width: 833px) and (max-width: 1900px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 100px !important;
                      max-height: 100px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }

                  




                    </style></head>
                          <body>
                              <!--*|IF:MC_PREVIEW_TEXT|*-->
                              <!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->
                              <!--*|END:IF|*-->
                              <center>
                                  <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                                      <tr>
                                          <td align="center" valign="top" id="bodyCell">
                                              <!-- BEGIN TEMPLATE  -->
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td align="center" valign="top" id="templateHeader" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="headerContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;">
                          <tbody class="mcnImageBlockOuter">
                                  <tr>
                                      <td valign="top" style="padding:0px" class="mcnImageBlockInner">
                                          <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;">
                                              <tbody><tr>
                                                  <td class="mcnImageContent" valign="top" style="padding-right: 0px; padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;">
                                                     
                                                          <!-- <a href="http:localhost:3000" >EDIT</a> -->
                     
                                                              <img align="center" alt="plz choose logo" src="${imageResponse.full_size_url}"  width="auto" 
                                                               style="min-height:100px;max-height:100px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border-radius: 0%;" class="abc mcnImage">
                                                         
                                                     
                                                  </td>
                                              </tr>
                                          </tbody></table>
                                      </td>
                                  </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td align="center" valign="top" id="templateBody" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="bodyContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">
                          <!--[if gte mso 9]>
                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                          <![endif]-->
                          <tbody class="mcnBoxedTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnBoxedTextBlockInner">
                                     
                                      <!--[if gte mso 9]>
                                      <td align="center" valign="top" ">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnBoxedTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                                             
                                                  <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%" style="min-width: 100% !important;background-color: #EEEEEE;">
                                                      <tbody><tr>
                                                          <td valign="top" class="mcnTextContent" style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                              <div style="text-align: center;">
                      <div style="text-align: left;"><span style="color:#3e5b77"><strong><span   class="contentoneto9">${req.body.content}</span></strong></span></div>
                      &nbsp;
                     
                      <div style="text-align: left;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                              <tr>
                                  <td class="contentoneto9" >${req.body.content1}<br>
                                  <br>
                                 ${req.body.content2}<br>
                                  <br>
                                  <strong>${req.body.content3}</td>
                              </tr>
                          </tbody>
                      </table>
                      </div>
                      </div>
                     
                                                          </td>
                                                      </tr>
                                                  </tbody></table>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if gte mso 9]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if gte mso 9]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width:100%;">
                          <tbody class="mcnButtonBlockOuter">
                              <tr>
                                  <td style="padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top" align="center" class="mcnButtonBlockInner">
                                      <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: separate !important;border-radius: 50px;background-color: #C69F6F;">
                                          <tbody>
                                              <tr>
                                                  <td align="center" valign="middle" class="mcnButtonContent" style="font-family: Roboto", &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 18px; padding: 15px;">
                                                      <a class="mcnButton " title="Schedule Attorney Consultation" href="${req.body.url}" target="_blank" style="width:290px;height:20px;padding-top:7px;font-weight: bold;letter-spacing: -0.5px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;">Schedule Attorney Consultation</a>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">
                          <!--[if gte mso 9]>
                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                          <![endif]-->
                          <tbody class="mcnBoxedTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnBoxedTextBlockInner">
                                     
                                      <!--[if gte mso 9]>
                                      <td align="center" valign="top" ">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnBoxedTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                                             
                                                  <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%" style="min-width: 100% !important;background-color: #EEEEEE;">
                                                      <tbody><tr>
                                                          <td valign="top" class="mcnTextContent" style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                              <div style="text-align: center;">
                      <div style="text-align: left;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                              <tr>
                                  <td class="contentoneto9" >${req.body.content4}<br>
                                  <br>
                                  ${req.body.content5}</td>
                              </tr>
                          </tbody>
                      </table>
                      </div>
                     
                      <div><br>
                      &nbsp;</div>
                     
                      <div style="text-align: left;" class="contentoneto9" >${req.body.content6}&nbsp;<br>
                      ${req.body.content7}<br>
                      ${req.body.content8}<br>
                      ${req.body.content9}&nbsp;</div>
                      </div>
                      
                     
                                                          </td>
                                                      </tr>
                                                  </tbody></table>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if gte mso 9]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if gte mso 9]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td align="center" valign="top" id="templateFooter" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="footerContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
                          <tbody class="mcnDividerBlockOuter">
                              <tr>
                                  <td class="mcnDividerBlockInner" style="min-width:100%; padding:18px;">
                                      <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px solid #505050;">
                                          <tbody><tr>
                                              <td>
                                                  <span></span>
                                              </td>
                                          </tr>
                                      </tbody></table>
                      <!--            
                                      <td class="mcnDividerBlockInner" style="padding: 18px;">
                                      <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
                      -->
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                          <tbody class="mcnTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                        <!--[if mso]>
                                      <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                      <tr>
                                      <![endif]-->
                                     
                                      <!--[if mso]>
                                      <td valign="top" width="600" style="width:600px;">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                                             
                                                  <span style="color:#000000" class="content9to11"><em>${req.body.content10}</em><br>
                      <strong>Our mailing address is:</strong></span><br>
                      <span style="color:#000000" class="content9to11">${req.body.content11}<br>
                      Want to change how you receive these emails?<br>
                      You can </span><a href="*|UPDATE_PROFILE|*"><span style="color:#000000" class="content9to11">update your preferences</span></a><span style="color:#000000" class="content9to11"> or </span><a href="*|UNSUB|*"><span style="color:#000000" class="content9to11">unsubscribe from this list</span></a><span style="color:#000000" class="content9to11">.</span>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if mso]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if mso]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                              </table>
                                              <!--  END TEMPLATE -->
                                          </td>
                                      </tr>
                                  </table>
                              </center>
                          </body>
                      </html>
                     
                      `
                            });
                     console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!response from template create',response) 
                  
                   var sql  = "insert into mailchimpTemplate (uid, content, content1, content2, content3, content4, content5, content6, content7, content8, content9,content10,content11,imageId,tempId,linkUrl) values ('" + result[0].id + "','" + req.body.content + "','" + req.body.content1 + "','" + req.body.content2 + "','"+req.body.content3 + "','" + req.body.content4 + "','" + req.body.content5 + "','" + req.body.content6 + "','" + req.body.content7 + "','" + req.body.content8 + "','" + req.body.content9 +"','" + req.body.content10 +"','" + req.body.content11 +"','"+imageResponse.id +"','"+response.id+"','"+req.body.url+"')";
                   
                      conn.query(sql,async (err)=>{
                        if(err){
                            console.log("hello this",err)
                        }
                        else{
                           
                            res.json({
                                msg:'hello ji template updated successfully!!!!',
                                dataa:req.body,
                                status:true
                             })
                      
                           
                        }
                   })
                }
              

            //     res.json({"response by api":req.body, status:true})  

             }
         })
      })
   })
 

router.post('/updateTemplateById/:id',upload,function (req, res) {
    req.getConnection((err, conn) => {
      //  console.log("req.body", req.body);
       // console.log("userid",req.body.userId)
        //console.log("hello ji hi how",req.files[0])
        
        conn.query("SELECT * FROM users WHERE id = '" + req.body.userId + "';", async (err, result) => {
            if (err) {
                console.log(err);
                res.json({ "msg": "Error", "status": false })
            } else {
                 console.log("id is",req.params.id)
                 var sql = "select * from mailchimpTemplate where cid='"+req.params.id+"'";
                 conn.query(sql, async (err,resultNew)=>{
                    if(err) {
                        return res.json({
                           msg:'something went wrong',
                           error:err
                        })
                    }else{
                            
                        if(req.files[0]){
                            
                          //  console.log("req.files[0]",req.files[0])
                           // console.log("result",resultNew[0].tempId);
                            console.log("result???????????????????????????????",resultNew[0]);
                             console.log("result???????????????????????????????",result[0]);
                            const tid = resultNew[0].tempId;
                            const imageUpdateId = resultNew[0].imageId
                            let base64IMG = base64_encode(path.join(__dirname, `../public/upload/${req.files[0].filename}`))

                            let imageExt = req.files[0].mimetype.split("/")[1];

                           let imageResponse = await uploadImageOnMailChimp(base64IMG, imageExt, { apiKey: result[0].mailchimpApiKey, server: result[0].mailchimpServer });
                           //  console.log("imageResponse", imageResponse.thumbnail_url)
                             //const imageresponse1 = imageResponse.thumbnail_url
                            // let listOfAll = await uploadedImageOnMailChimpList({ apiKey: result[0].mailchimpApiKey, server: result[0].mailchimpServer });
                            //  console.log("listOfAll", listOfAll);
                             



                                 mailchimp.setConfig({
                                    apiKey: result[0].mailchimpApiKey,
                                    server: result[0].mailchimpServer
                                });

                        const run = async (tid) => {
                              const response = await mailchimp.templates.updateTemplate(tid, {
                                name: "Sample Solicitation",
                                html: ` <!doctype html>
                     <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                         <head>
                             <!-- NAME: SELL PRODUCTS -->
                             <!--[if gte mso 15]>
                             <xml>
                                 <o:OfficeDocumentSettings>
                                 <o:AllowPNG/>
                                 <o:PixelsPerInch>96</o:PixelsPerInch>
                                 </o:OfficeDocumentSettings>
                             </xml>
                             <![endif]-->
                             <meta charset="UTF-8">
                             <meta http-equiv="X-UA-Compatible" content="IE=edge">
                             <meta name="viewport" content="width=device-width, initial-scale=1">
                             <title>*|MC:SUBJECT|*</title>
                             
                         <style type="text/css">
                             p{
                                 margin:10px 0;
                                 padding:0;
                             }
                             table{
                                 border-collapse:collapse;
                             }
                             h1,h2,h3,h4,h5,h6{
                                 display:block;
                                 margin:0;
                                 padding:0;
                             }
                             img,a img{
                                 border:0;
                                 height:auto;
                                 outline:none;
                                 text-decoration:none;
                             }
                             body,#bodyTable,#bodyCell{
                                 height:100%;
                                 margin:0;
                                 padding:0;
                                 width:100%;
                             }
                             .mcnPreviewText{
                                 display:none !important;
                             }
                             #outlook a{
                                 padding:0;
                             }
                             img{
                                 -ms-interpolation-mode:bicubic;
                             }
                             table{
                                 mso-table-lspace:0pt;
                                 mso-table-rspace:0pt;
                             }
                             .ReadMsgBody{
                                 width:100%;
                             }
                             .ExternalClass{
                                 width:100%;
                             }
                             p,a,li,td,blockquote{
                                 mso-line-height-rule:exactly;
                             }
                             a[href^=tel],a[href^=sms]{
                                 color:inherit;
                                 cursor:default;
                                 text-decoration:none;
                             }
                             p,a,li,td,body,table,blockquote{
                                 -ms-text-size-adjust:100%;
                                 -webkit-text-size-adjust:100%;
                             }
                             .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
                                 line-height:100%;
                             }
                             a[x-apple-data-detectors]{
                                 color:inherit !important;
                                 text-decoration:none !important;
                                 font-size:inherit !important;
                                 font-family:inherit !important;
                                 font-weight:inherit !important;
                                 line-height:inherit !important;
                             }
                             .templateContainer{
                                 max-width:600px !important;
                             }
                             a.mcnButton{
                                 display:block;
                             }
                             .mcnImage,.mcnRetinaImage{
                                 vertical-align:bottom;
                             }
                             .mcnTextContent{
                                 word-break:break-word;
                             }
                             .mcnTextContent img{
                                 height:auto !important;
                             }
                             .mcnDividerBlock{
                                 table-layout:fixed !important;
                             }
                         /*
                         @tab Page
                         @section Heading 1
                         @style heading 1
                         */
                             h1{
                                 /*@editable*/color:#222222;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:40px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:center;
                             }
                         /*
                         @tab Page
                         @section Heading 2
                         @style heading 2
                         */
                             h2{
                                 /*@editable*/color:#222222;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:34px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Page
                         @section Heading 3
                         @style heading 3
                         */
                             h3{
                                 /*@editable*/color:#444444;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:22px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Page
                         @section Heading 4
                         @style heading 4
                         */
                             h4{
                                 /*@editable*/color:#949494;
                                 /*@editable*/font-family:Georgia;
                                 /*@editable*/font-size:20px;
                                 /*@editable*/font-style:italic;
                                 /*@editable*/font-weight:normal;
                                 /*@editable*/line-height:125%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Header
                         @section Header Container Style
                         */
                             #templateHeader{
                                 /*@editable*/background-color:#eeeeee;
                                 /*@editable*/background-image:none;
                                 /*@editable*/background-repeat:no-repeat;
                                 /*@editable*/background-position:center;
                                 /*@editable*/background-size:cover;
                                 /*@editable*/border-top:0;
                                 /*@editable*/border-bottom:0;
                                 /*@editable*/padding-top:12px;
                                 /*@editable*/padding-bottom:12px;
                             }
                         /*
                         @tab Header
                         @section Header Interior Style
                         */
                             .headerContainer{
                                 /*@editable*/background-color:transparent;
                                 /*@editable*/background-image:none;
                                 /*@editable*/background-repeat:no-repeat;
                                 /*@editable*/background-position:center;
                                 /*@editable*/background-size:cover;
                                 /*@editable*/border-top:0;
                                 /*@editable*/border-bottom:0;
                                 /*@editable*/padding-top:0;
                                 /*@editable*/padding-bottom:0;
                             }
                         /*
                         @tab Header
                         @section Header Text
                         */
                             .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
                                 /*@editable*/color:#757575;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:16px;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Header
                         @section Header Link
                         */
                             .headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{
                                 /*@editable*/color:#007C89;
                                 /*@editable*/font-weight:normal;
                                 /*@editable*/text-decoration:underline;
                             }
                         /*
                         @tab Body
                         @section Body Container Style
                         */
                             #templateBody{
                                  /*@editable*/background-color:#FFFFFF;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:12px;
                                  /*@editable*/padding-bottom:12px;
                              }
                          /*
                          @tab Body
                          @section Body Interior Style
                          */
                              .bodyContainer{
                                  /*@editable*/background-color:transparent;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0;
                                  /*@editable*/padding-bottom:0;
                              }
                          /*
                          @tab Body
                          @section Body Text
                          */
                              .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
                                  /*@editable*/color:#757575;
                                  /*@editable*/font-family:Helvetica;
                                  /*@editable*/font-size:16px;
                                  /*@editable*/line-height:150%;
                                  /*@editable*/text-align:left;
                              }
                          /*
                          @tab Body
                          @section Body Link
                          */
                              .bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{
                                  /*@editable*/color:#007C89;
                                  /*@editable*/font-weight:normal;
                                  /*@editable*/text-decoration:underline;
                              }
                          /*
                          @tab Footer
                          @section Footer Style
                          */
                              #templateFooter{
                                  /*@editable*/background-color:#eeeeee;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0px;
                                  /*@editable*/padding-bottom:0px;
                              }
                          /*
                          @tab Footer
                          @section Footer Interior Style
                          */
                              .footerContainer{
                                  /*@editable*/background-color:transparent;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0;
                                  /*@editable*/padding-bottom:0;
                              }
                          /*
                          @tab Footer
                          @section Footer Text
                          */
                              .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
                                  /*@editable*/color:#FFFFFF;
                                  /*@editable*/font-family:Helvetica;
                                  /*@editable*/font-size:12px;
                                  /*@editable*/line-height:150%;
                                  /*@editable*/text-align:center;
                              }
                          /*
                          @tab Footer
                          @section Footer Link
                          */
                              .footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{
                                  /*@editable*/color:#FFFFFF;
                                  /*@editable*/font-weight:normal;
                                  /*@editable*/text-decoration:underline;
                              }
                          @media only screen and (min-width:768px){
                              .templateContainer{
                                  width:600px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              body,table,td,p,a,li,blockquote{
                                  -webkit-text-size-adjust:none !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              body{
                                  width:100% !important;
                                  min-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnRetinaImage{
                                  max-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImage{
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
                                  max-width:100% !important;
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnBoxedTextContentContainer{
                                  min-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupContent{
                                  padding:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
                                  padding-top:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
                                  padding-top:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardBottomImageContent{
                                  padding-bottom:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupBlockInner{
                                  padding-top:0 !important;
                                  padding-bottom:0 !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupBlockOuter{
                                  padding-top:9px !important;
                                  padding-bottom:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnTextContent,.mcnBoxedTextContentColumn{
                                  padding-right:18px !important;
                                  padding-left:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
                                  padding-right:18px !important;
                                  padding-bottom:0 !important;
                                  padding-left:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcpreview-image-uploader{
                                  display:none !important;
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 1
                          @tip Make the first-level headings larger in size for better readability on small screens.
                          */
                              h1{
                                  /*@editable*/font-size:30px !important;
                                  /*@editable*/line-height:125% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 2
                          @tip Make the second-level headings larger in size for better readability on small screens.
                          */
                              h2{
                                  /*@editable*/font-size:26px !important;
                                  /*@editable*/line-height:125% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 3
                          @tip Make the third-level headings larger in size for better readability on small screens.
                          */
                              h3{
                                  /*@editable*/font-size:20px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 4
                          @tip Make the fourth-level headings larger in size for better readability on small screens.
                          */
                              h4{
                                  /*@editable*/font-size:18px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Boxed Text
                          @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                          */
                              .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
                                  /*@editable*/font-size:14px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Header Text
                          @tip Make the header text larger in size for better readability on small screens.
                          */
                              .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
                                  /*@editable*/font-size:16px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Body Text
                          @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                          */
                              .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
                                  /*@editable*/font-size:16px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Footer Text
                          @tip Make the footer content text larger in size for better readability on small screens.
                          */
                              .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
                                  /*@editable*/font-size:14px !important;
                                  /*@editable*/line-height:150% !important;
                              }

               





                     
                      }


                    @media only screen and (min-width: 0px) and (max-width: 320px){

                   .abc{
                      width:auto !important;
                      min-height: 50px !important;
                      max-height: 50px!important;
                     }
                     .contentoneto9{
                      font-size: 13px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }

                   @media screen and (min-width: 321px) and (max-width: 575px) {
  
                      .abc{
                      width:auto !important;
                      min-height: 70px !important;
                      max-height: 70px!important;
                      
                     }
                     
                     .contentoneto9{
                      font-size: 13px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }


                   }
                    @media screen and (min-width: 576px) and (max-width: 700px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 80px !important;
                      max-height: 80px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }
                    @media screen and (min-width: 701px) and (max-width: 832px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 90px !important;
                      max-height: 90px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }
                   @media screen and (min-width: 833px) and (max-width: 1900px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 100px !important;
                      max-height: 100px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }

                  

                    </style></head>
                          <body>
                              <!--*|IF:MC_PREVIEW_TEXT|*-->
                              <!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->
                              <!--*|END:IF|*-->
                              <center>
                                  <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                                      <tr>
                                          <td align="center" valign="top" id="bodyCell">
                                              <!-- BEGIN TEMPLATE  -->
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td align="center" valign="top" id="templateHeader" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="headerContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;">
                          <tbody class="mcnImageBlockOuter">
                                  <tr>
                                      <td valign="top" style="padding:0px" class="mcnImageBlockInner">
                                          <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;">
                                              <tbody><tr>
                                                  <td class="mcnImageContent" valign="top" style="padding-right: 0px; padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;">
                                                     
                                                          <!-- <a href="http:localhost:3000" >EDIT</a> -->
                     
                                                              <img align="center" alt="plz choose logo" src="${imageResponse.full_size_url}"  width="auto" 
                                                               style="min-height:100px;max-height:100px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border-radius: 0%;" class="abc mcnImage">
                                                         
                                                     
                                                  </td>
                                              </tr>
                                          </tbody></table>
                                      </td>
                                  </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td align="center" valign="top" id="templateBody" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="bodyContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">
                          <!--[if gte mso 9]>
                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                          <![endif]-->
                          <tbody class="mcnBoxedTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnBoxedTextBlockInner">
                                     
                                      <!--[if gte mso 9]>
                                      <td align="center" valign="top" ">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnBoxedTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                                             
                                                  <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%" style="min-width: 100% !important;background-color: #EEEEEE;">
                                                      <tbody><tr>
                                                          <td valign="top" class="mcnTextContent" style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                              <div style="text-align: center;">
                      <div style="text-align: left;"><span style="color:#3e5b77"><strong><span   class="contentoneto9">${req.body.content}</span></strong></span></div>
                      &nbsp;
                     
                      <div style="text-align: left;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                              <tr>
                                  <td class="contentoneto9" >${req.body.content1}<br>
                                  <br>
                                 ${req.body.content2}<br>
                                  <br>
                                  <strong>${req.body.content3}</td>
                              </tr>
                          </tbody>
                      </table>
                      </div>
                      </div>
                     
                                                          </td>
                                                      </tr>
                                                  </tbody></table>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if gte mso 9]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if gte mso 9]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width:100%;">
                          <tbody class="mcnButtonBlockOuter">
                              <tr>
                                  <td style="padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top" align="center" class="mcnButtonBlockInner">
                                      <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: separate !important;border-radius: 50px;background-color: #C69F6F;">
                                          <tbody>
                                              <tr>
                                                  <td align="center" valign="middle" class="mcnButtonContent" style="font-family: Roboto", &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 18px; padding: 15px;">
                                                      <a class="mcnButton " title="Schedule Attorney Consultation" href="${req.body.url}" target="_blank" style="width:290px;height:20px;padding-top:7px;font-weight: bold;letter-spacing: -0.5px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;">Schedule Attorney Consultation</a>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">
                          <!--[if gte mso 9]>
                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                          <![endif]-->
                          <tbody class="mcnBoxedTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnBoxedTextBlockInner">
                                     
                                      <!--[if gte mso 9]>
                                      <td align="center" valign="top" ">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnBoxedTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                                             
                                                  <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%" style="min-width: 100% !important;background-color: #EEEEEE;">
                                                      <tbody><tr>
                                                          <td valign="top" class="mcnTextContent" style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                              <div style="text-align: center;">
                      <div style="text-align: left;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                              <tr>
                                  <td class="contentoneto9" >${req.body.content4}<br>
                                  <br>
                                  ${req.body.content5}</td>
                              </tr>
                          </tbody>
                      </table>
                      </div>
                     
                      <div><br>
                      &nbsp;</div>
                     
                      <div style="text-align: left;" class="contentoneto9" >${req.body.content6}&nbsp;<br>
                      ${req.body.content7}<br>
                      ${req.body.content8}<br>
                      ${req.body.content9}&nbsp;</div>
                      </div>
                      
                     
                                                          </td>
                                                      </tr>
                                                  </tbody></table>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if gte mso 9]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if gte mso 9]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td align="center" valign="top" id="templateFooter" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="footerContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
                          <tbody class="mcnDividerBlockOuter">
                              <tr>
                                  <td class="mcnDividerBlockInner" style="min-width:100%; padding:18px;">
                                      <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px solid #505050;">
                                          <tbody><tr>
                                              <td>
                                                  <span></span>
                                              </td>
                                          </tr>
                                      </tbody></table>
                      <!--            
                                      <td class="mcnDividerBlockInner" style="padding: 18px;">
                                      <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
                      -->
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                          <tbody class="mcnTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                        <!--[if mso]>
                                      <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                      <tr>
                                      <![endif]-->
                                     
                                      <!--[if mso]>
                                      <td valign="top" width="600" style="width:600px;">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                                             
                                                  <span style="color:#000000" class="content9to11"><em>${req.body.content10}</em><br>
                      <strong>Our mailing address is:</strong></span><br>
                      <span style="color:#000000" class="content9to11">${req.body.content11}<br>
                      Want to change how you receive these emails?<br>
                      You can </span><a href="*|UPDATE_PROFILE|*"><span style="color:#000000" class="content9to11">update your preferences</span></a><span style="color:#000000" class="content9to11"> or </span><a href="*|UNSUB|*"><span style="color:#000000" class="content9to11">unsubscribe from this list</span></a><span style="color:#000000" class="content9to11">.</span>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if mso]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if mso]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                              </table>
                                              <!--  END TEMPLATE -->
                                          </td>
                                      </tr>
                                  </table>
                              </center>
                          </body>
                      </html>`
                              });
                             return response
                            };
                       
                            const data1 = await run(tid);
                            console.log("data1",data1)
                           
                          
                            var sql = "UPDATE mailchimpTemplate SET content = '" + req.body.content +"', content1 = '" + req.body.content1 +"', content2 = '" + req.body.content2 +"', content3 = '" + req.body.content3 +"', content4 = '" + req.body.content4 +"', content5 = '" + req.body.content5 +"', content6 = '" + req.body.content6 +"', content7 = '" + req.body.content7 +"', content8 = '" + req.body.content8 +"', content9 = '" + req.body.content9 + "', content10 = '" + req.body.content10+"', content11 = '" + req.body.content11+"',imageId ='"+imageResponse.id+"',tempId ='"+data1.id+"', linkUrl = '" + req.body.url +"' WHERE cid = " + resultNew[0].cid + ";"
                           
                           conn.query(sql, async (err)=>{
                            if(err) {
                                return res.json({
                                    error:err
                                })
                            }else{
                               
                                res.json({
                                    msg:'data updated successfully!!!!!!!'
                                })
                            
                              }
                         })

                            

                            }

                            else{

                         const ImageId = resultNew[0].imageId                          
                         const tid = resultNew[0].tempId; 
                            mailchimp.setConfig({
                              apiKey: result[0].mailchimpApiKey,
                              server: result[0].mailchimpServer
                            });

                            const run1 = async (ImageId) => {
                              const response2 = await mailchimp.fileManager.getFile(ImageId);
                              return response2
                            };

                            const fileurldata = await run1(ImageId);
                            console.log("fileurldata",fileurldata.full_size_url)
                            

                        const run = async (tid) => {
                              const response = await mailchimp.templates.updateTemplate(tid, {
                                name: "Sample Solicitation",
                                html: ` <!doctype html>
                     <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
                         <head>
                             <!-- NAME: SELL PRODUCTS -->
                             <!--[if gte mso 15]>
                             <xml>
                                 <o:OfficeDocumentSettings>
                                 <o:AllowPNG/>
                                 <o:PixelsPerInch>96</o:PixelsPerInch>
                                 </o:OfficeDocumentSettings>
                             </xml>
                             <![endif]-->
                             <meta charset="UTF-8">
                             <meta http-equiv="X-UA-Compatible" content="IE=edge">
                             <meta name="viewport" content="width=device-width, initial-scale=1">
                             <title>*|MC:SUBJECT|*</title>
                             
                         <style type="text/css">
                             p{
                                 margin:10px 0;
                                 padding:0;
                             }
                             table{
                                 border-collapse:collapse;
                             }
                             h1,h2,h3,h4,h5,h6{
                                 display:block;
                                 margin:0;
                                 padding:0;
                             }
                             img,a img{
                                 border:0;
                                 height:auto;
                                 outline:none;
                                 text-decoration:none;
                             }
                             body,#bodyTable,#bodyCell{
                                 height:100%;
                                 margin:0;
                                 padding:0;
                                 width:100%;
                             }
                             .mcnPreviewText{
                                 display:none !important;
                             }
                             #outlook a{
                                 padding:0;
                             }
                             img{
                                 -ms-interpolation-mode:bicubic;
                             }
                             table{
                                 mso-table-lspace:0pt;
                                 mso-table-rspace:0pt;
                             }
                             .ReadMsgBody{
                                 width:100%;
                             }
                             .ExternalClass{
                                 width:100%;
                             }
                             p,a,li,td,blockquote{
                                 mso-line-height-rule:exactly;
                             }
                             a[href^=tel],a[href^=sms]{
                                 color:inherit;
                                 cursor:default;
                                 text-decoration:none;
                             }
                             p,a,li,td,body,table,blockquote{
                                 -ms-text-size-adjust:100%;
                                 -webkit-text-size-adjust:100%;
                             }
                             .ExternalClass,.ExternalClass p,.ExternalClass td,.ExternalClass div,.ExternalClass span,.ExternalClass font{
                                 line-height:100%;
                             }
                             a[x-apple-data-detectors]{
                                 color:inherit !important;
                                 text-decoration:none !important;
                                 font-size:inherit !important;
                                 font-family:inherit !important;
                                 font-weight:inherit !important;
                                 line-height:inherit !important;
                             }
                             .templateContainer{
                                 max-width:600px !important;
                             }
                             a.mcnButton{
                                 display:block;
                             }
                             .mcnImage,.mcnRetinaImage{
                                 vertical-align:bottom;
                             }
                             .mcnTextContent{
                                 word-break:break-word;
                             }
                             .mcnTextContent img{
                                 height:auto !important;
                             }
                             .mcnDividerBlock{
                                 table-layout:fixed !important;
                             }
                         /*
                         @tab Page
                         @section Heading 1
                         @style heading 1
                         */
                             h1{
                                 /*@editable*/color:#222222;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:40px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:center;
                             }
                         /*
                         @tab Page
                         @section Heading 2
                         @style heading 2
                         */
                             h2{
                                 /*@editable*/color:#222222;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:34px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Page
                         @section Heading 3
                         @style heading 3
                         */
                             h3{
                                 /*@editable*/color:#444444;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:22px;
                                 /*@editable*/font-style:normal;
                                 /*@editable*/font-weight:bold;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Page
                         @section Heading 4
                         @style heading 4
                         */
                             h4{
                                 /*@editable*/color:#949494;
                                 /*@editable*/font-family:Georgia;
                                 /*@editable*/font-size:20px;
                                 /*@editable*/font-style:italic;
                                 /*@editable*/font-weight:normal;
                                 /*@editable*/line-height:125%;
                                 /*@editable*/letter-spacing:normal;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Header
                         @section Header Container Style
                         */
                             #templateHeader{
                                 /*@editable*/background-color:#eeeeee;
                                 /*@editable*/background-image:none;
                                 /*@editable*/background-repeat:no-repeat;
                                 /*@editable*/background-position:center;
                                 /*@editable*/background-size:cover;
                                 /*@editable*/border-top:0;
                                 /*@editable*/border-bottom:0;
                                 /*@editable*/padding-top:12px;
                                 /*@editable*/padding-bottom:12px;
                             }
                         /*
                         @tab Header
                         @section Header Interior Style
                         */
                             .headerContainer{
                                 /*@editable*/background-color:transparent;
                                 /*@editable*/background-image:none;
                                 /*@editable*/background-repeat:no-repeat;
                                 /*@editable*/background-position:center;
                                 /*@editable*/background-size:cover;
                                 /*@editable*/border-top:0;
                                 /*@editable*/border-bottom:0;
                                 /*@editable*/padding-top:0;
                                 /*@editable*/padding-bottom:0;
                             }
                         /*
                         @tab Header
                         @section Header Text
                         */
                             .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
                                 /*@editable*/color:#757575;
                                 /*@editable*/font-family:Helvetica;
                                 /*@editable*/font-size:16px;
                                 /*@editable*/line-height:150%;
                                 /*@editable*/text-align:left;
                             }
                         /*
                         @tab Header
                         @section Header Link
                         */
                             .headerContainer .mcnTextContent a,.headerContainer .mcnTextContent p a{
                                 /*@editable*/color:#007C89;
                                 /*@editable*/font-weight:normal;
                                 /*@editable*/text-decoration:underline;
                             }
                         /*
                         @tab Body
                         @section Body Container Style
                         */
                             #templateBody{
                                  /*@editable*/background-color:#FFFFFF;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:12px;
                                  /*@editable*/padding-bottom:12px;
                              }
                          /*
                          @tab Body
                          @section Body Interior Style
                          */
                              .bodyContainer{
                                  /*@editable*/background-color:transparent;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0;
                                  /*@editable*/padding-bottom:0;
                              }
                          /*
                          @tab Body
                          @section Body Text
                          */
                              .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
                                  /*@editable*/color:#757575;
                                  /*@editable*/font-family:Helvetica;
                                  /*@editable*/font-size:16px;
                                  /*@editable*/line-height:150%;
                                  /*@editable*/text-align:left;
                              }
                          /*
                          @tab Body
                          @section Body Link
                          */
                              .bodyContainer .mcnTextContent a,.bodyContainer .mcnTextContent p a{
                                  /*@editable*/color:#007C89;
                                  /*@editable*/font-weight:normal;
                                  /*@editable*/text-decoration:underline;
                              }
                          /*
                          @tab Footer
                          @section Footer Style
                          */
                              #templateFooter{
                                  /*@editable*/background-color:#eeeeee;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0px;
                                  /*@editable*/padding-bottom:0px;
                              }
                          /*
                          @tab Footer
                          @section Footer Interior Style
                          */
                              .footerContainer{
                                  /*@editable*/background-color:transparent;
                                  /*@editable*/background-image:none;
                                  /*@editable*/background-repeat:no-repeat;
                                  /*@editable*/background-position:center;
                                  /*@editable*/background-size:cover;
                                  /*@editable*/border-top:0;
                                  /*@editable*/border-bottom:0;
                                  /*@editable*/padding-top:0;
                                  /*@editable*/padding-bottom:0;
                              }
                          /*
                          @tab Footer
                          @section Footer Text
                          */
                              .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
                                  /*@editable*/color:#FFFFFF;
                                  /*@editable*/font-family:Helvetica;
                                  /*@editable*/font-size:12px;
                                  /*@editable*/line-height:150%;
                                  /*@editable*/text-align:center;
                              }
                          /*
                          @tab Footer
                          @section Footer Link
                          */
                              .footerContainer .mcnTextContent a,.footerContainer .mcnTextContent p a{
                                  /*@editable*/color:#FFFFFF;
                                  /*@editable*/font-weight:normal;
                                  /*@editable*/text-decoration:underline;
                              }
                          @media only screen and (min-width:768px){
                              .templateContainer{
                                  width:600px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              body,table,td,p,a,li,blockquote{
                                  -webkit-text-size-adjust:none !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              body{
                                  width:100% !important;
                                  min-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnRetinaImage{
                                  max-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImage{
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnCartContainer,.mcnCaptionTopContent,.mcnRecContentContainer,.mcnCaptionBottomContent,.mcnTextContentContainer,.mcnBoxedTextContentContainer,.mcnImageGroupContentContainer,.mcnCaptionLeftTextContentContainer,.mcnCaptionRightTextContentContainer,.mcnCaptionLeftImageContentContainer,.mcnCaptionRightImageContentContainer,.mcnImageCardLeftTextContentContainer,.mcnImageCardRightTextContentContainer,.mcnImageCardLeftImageContentContainer,.mcnImageCardRightImageContentContainer{
                                  max-width:100% !important;
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnBoxedTextContentContainer{
                                  min-width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupContent{
                                  padding:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnCaptionLeftContentOuter .mcnTextContent,.mcnCaptionRightContentOuter .mcnTextContent{
                                  padding-top:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardTopImageContent,.mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,.mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent{
                                  padding-top:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardBottomImageContent{
                                  padding-bottom:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupBlockInner{
                                  padding-top:0 !important;
                                  padding-bottom:0 !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageGroupBlockOuter{
                                  padding-top:9px !important;
                                  padding-bottom:9px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnTextContent,.mcnBoxedTextContentColumn{
                                  padding-right:18px !important;
                                  padding-left:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcnImageCardLeftImageContent,.mcnImageCardRightImageContent{
                                  padding-right:18px !important;
                                  padding-bottom:0 !important;
                                  padding-left:18px !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                              .mcpreview-image-uploader{
                                  display:none !important;
                                  width:100% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 1
                          @tip Make the first-level headings larger in size for better readability on small screens.
                          */
                              h1{
                                  /*@editable*/font-size:30px !important;
                                  /*@editable*/line-height:125% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 2
                          @tip Make the second-level headings larger in size for better readability on small screens.
                          */
                              h2{
                                  /*@editable*/font-size:26px !important;
                                  /*@editable*/line-height:125% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 3
                          @tip Make the third-level headings larger in size for better readability on small screens.
                          */
                              h3{
                                  /*@editable*/font-size:20px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Heading 4
                          @tip Make the fourth-level headings larger in size for better readability on small screens.
                          */
                              h4{
                                  /*@editable*/font-size:18px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Boxed Text
                          @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                          */
                              .mcnBoxedTextContentContainer .mcnTextContent,.mcnBoxedTextContentContainer .mcnTextContent p{
                                  /*@editable*/font-size:14px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Header Text
                          @tip Make the header text larger in size for better readability on small screens.
                          */
                              .headerContainer .mcnTextContent,.headerContainer .mcnTextContent p{
                                  /*@editable*/font-size:16px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Body Text
                          @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                          */
                              .bodyContainer .mcnTextContent,.bodyContainer .mcnTextContent p{
                                  /*@editable*/font-size:16px !important;
                                  /*@editable*/line-height:150% !important;
                              }
                     
                      } @media only screen and (max-width: 480px){
                          /*
                          @tab Mobile Styles
                          @section Footer Text
                          @tip Make the footer content text larger in size for better readability on small screens.
                          */
                              .footerContainer .mcnTextContent,.footerContainer .mcnTextContent p{
                                  /*@editable*/font-size:14px !important;
                                  /*@editable*/line-height:150% !important;
                              }

               





                     
                      }


                    @media only screen and (min-width: 0px) and (max-width: 320px){

                   .abc{
                      width:auto !important;
                      min-height: 50px !important;
                      max-height: 50px!important;
                     }
                     .contentoneto9{
                      font-size: 13px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }

                   @media screen and (min-width: 321px) and (max-width: 575px) {
  
                      .abc{
                      width:auto !important;
                      min-height: 70px !important;
                      max-height: 70px!important;
                      
                     }
                     
                     .contentoneto9{
                      font-size: 13px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }


                   }
                    @media screen and (min-width: 576px) and (max-width: 700px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 80px !important;
                      max-height: 80px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }
                    @media screen and (min-width: 701px) and (max-width: 832px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 90px !important;
                      max-height: 90px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }
                   @media screen and (min-width: 833px) and (max-width: 1900px) {
  
                     .abc{
                       width:auto !important;
                      min-height: 100px !important;
                      max-height: 100px!important;
                      
                     }
                      .contentoneto9{
                      font-size: 14px;
                     }
                     .content9to11{
                      font-size: 10px;
                     }

                   }

                  

        
                    </style></head>
                          <body>
                              <!--*|IF:MC_PREVIEW_TEXT|*-->
                              <!--[if !gte mso 9]><!----><span class="mcnPreviewText" style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span><!--<![endif]-->
                              <!--*|END:IF|*-->
                              <center>
                                  <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                                      <tr>
                                          <td align="center" valign="top" id="bodyCell">
                                              <!-- BEGIN TEMPLATE  -->
                                              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                  <tr>
                                                      <td align="center" valign="top" id="templateHeader" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="headerContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnImageBlock" style="min-width:100%;">
                          <tbody class="mcnImageBlockOuter">
                                  <tr>
                                      <td valign="top" style="padding:0px" class="mcnImageBlockInner">
                                          <table align="left" width="100%" border="0" cellpadding="0" cellspacing="0" class="mcnImageContentContainer" style="min-width:100%;">
                                              <tbody><tr>
                                                  <td class="mcnImageContent" valign="top" style="padding-right: 0px; padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;">
                                                     
                                                          <!-- <a href="http:localhost:3000" >EDIT</a> -->
                     
                                                              <img align="center" alt="plz choose logo" src="${fileurldata.full_size_url}"  width="auto" 
                                                               style="min-height:100px;max-height:100px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border-radius: 0%;" class="abc mcnImage">
                                                         
                                                     
                                                  </td>
                                              </tr>
                                          </tbody></table>
                                      </td>
                                  </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td align="center" valign="top" id="templateBody" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="bodyContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">
                          <!--[if gte mso 9]>
                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                          <![endif]-->
                          <tbody class="mcnBoxedTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnBoxedTextBlockInner">
                                     
                                      <!--[if gte mso 9]>
                                      <td align="center" valign="top" ">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnBoxedTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                                             
                                                  <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%" style="min-width: 100% !important;background-color: #EEEEEE;">
                                                      <tbody><tr>
                                                          <td valign="top" class="mcnTextContent" style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                              <div style="text-align: center;">
                      <div style="text-align: left;"><span style="color:#3e5b77"><strong><span   class="contentoneto9">${req.body.content}</span></strong></span></div>
                      &nbsp;
                     
                      <div style="text-align: left;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                              <tr>
                                  <td class="contentoneto9" >${req.body.content1}<br>
                                  <br>
                                 ${req.body.content2}<br>
                                  <br>
                                  <strong>${req.body.content3}</td>
                              </tr>
                          </tbody>
                      </table>
                      </div>
                      </div>
                     
                                                          </td>
                                                      </tr>
                                                  </tbody></table>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if gte mso 9]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if gte mso 9]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnButtonBlock" style="min-width:100%;">
                          <tbody class="mcnButtonBlockOuter">
                              <tr>
                                  <td style="padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;" valign="top" align="center" class="mcnButtonBlockInner">
                                      <table border="0" cellpadding="0" cellspacing="0" class="mcnButtonContentContainer" style="border-collapse: separate !important;border-radius: 50px;background-color: #C69F6F;">
                                          <tbody>
                                              <tr>
                                                  <td align="center" valign="middle" class="mcnButtonContent" style="font-family: Roboto", &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 18px; padding: 15px;">
                                                      <a class="mcnButton " title="Schedule Attorney Consultation" href="${req.body.url}" target="_blank" style="width:290px;height:20px;padding-top:7px;font-weight: bold;letter-spacing: -0.5px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;">Schedule Attorney Consultation</a>
                                                  </td>
                                              </tr>
                                          </tbody>
                                      </table>
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnBoxedTextBlock" style="min-width:100%;">
                          <!--[if gte mso 9]>
                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                          <![endif]-->
                          <tbody class="mcnBoxedTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnBoxedTextBlockInner">
                                     
                                      <!--[if gte mso 9]>
                                      <td align="center" valign="top" ">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width:100%;" class="mcnBoxedTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                                             
                                                  <table border="0" cellspacing="0" class="mcnTextContentContainer" width="100%" style="min-width: 100% !important;background-color: #EEEEEE;">
                                                      <tbody><tr>
                                                          <td valign="top" class="mcnTextContent" style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                              <div style="text-align: center;">
                      <div style="text-align: left;">
                      <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                          <tbody>
                              <tr>
                                  <td class="contentoneto9" >${req.body.content4}<br>
                                  <br>
                                  ${req.body.content5}</td>
                              </tr>
                          </tbody>
                      </table>
                      </div>
                     
                      <div><br>
                      &nbsp;</div>
                     
                      <div style="text-align: left;" class="contentoneto9" >${req.body.content6}&nbsp;<br>
                      ${req.body.content7}<br>
                      ${req.body.content8}<br>
                      ${req.body.content9}&nbsp;</div>
                      </div>
                      
                     
                                                          </td>
                                                      </tr>
                                                  </tbody></table>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if gte mso 9]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if gte mso 9]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                                  <tr>
                                                      <td align="center" valign="top" id="templateFooter" data-template-container>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                          <tr>
                                                          <td align="center" valign="top" width="600" style="width:600px;">
                                                          <![endif]-->
                                                          <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" class="templateContainer">
                                                              <tr>
                                                                  <td valign="top" class="footerContainer"><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnDividerBlock" style="min-width:100%;">
                          <tbody class="mcnDividerBlockOuter">
                              <tr>
                                  <td class="mcnDividerBlockInner" style="min-width:100%; padding:18px;">
                                      <table class="mcnDividerContent" border="0" cellpadding="0" cellspacing="0" width="100%" style="min-width: 100%;border-top: 2px solid #505050;">
                                          <tbody><tr>
                                              <td>
                                                  <span></span>
                                              </td>
                                          </tr>
                                      </tbody></table>
                      <!--            
                                      <td class="mcnDividerBlockInner" style="padding: 18px;">
                                      <hr class="mcnDividerContent" style="border-bottom-color:none; border-left-color:none; border-right-color:none; border-bottom-width:0; border-left-width:0; border-right-width:0; margin-top:0; margin-right:0; margin-bottom:0; margin-left:0;" />
                      -->
                                  </td>
                              </tr>
                          </tbody>
                      </table><table border="0" cellpadding="0" cellspacing="0" width="100%" class="mcnTextBlock" style="min-width:100%;">
                          <tbody class="mcnTextBlockOuter">
                              <tr>
                                  <td valign="top" class="mcnTextBlockInner" style="padding-top:9px;">
                                        <!--[if mso]>
                                      <table align="left" border="0" cellspacing="0" cellpadding="0" width="100%" style="width:100%;">
                                      <tr>
                                      <![endif]-->
                                     
                                      <!--[if mso]>
                                      <td valign="top" width="600" style="width:600px;">
                                      <![endif]-->
                                      <table align="left" border="0" cellpadding="0" cellspacing="0" style="max-width:100%; min-width:100%;" width="100%" class="mcnTextContentContainer">
                                          <tbody><tr>
                                             
                                              <td valign="top" class="mcnTextContent" style="padding-top:0; padding-right:18px; padding-bottom:9px; padding-left:18px;">
                                             
                                                  <span style="color:#000000" class="content9to11"><em>${req.body.content10}</em><br>
                      <strong>Our mailing address is:</strong></span><br>
                      <span style="color:#000000" class="content9to11">${req.body.content11}<br>
                      Want to change how you receive these emails?<br>
                      You can </span><a href="*|UPDATE_PROFILE|*"><span style="color:#000000" class="content9to11">update your preferences</span></a><span style="color:#000000" class="content9to11"> or </span><a href="*|UNSUB|*"><span style="color:#000000" class="content9to11">unsubscribe from this list</span></a><span style="color:#000000" class="content9to11">.</span>
                                              </td>
                                          </tr>
                                      </tbody></table>
                                      <!--[if mso]>
                                      </td>
                                      <![endif]-->
                                     
                                      <!--[if mso]>
                                      </tr>
                                      </table>
                                      <![endif]-->
                                  </td>
                              </tr>
                          </tbody>
                      </table></td>
                                                              </tr>
                                                          </table>
                                                          <!--[if (gte mso 9)|(IE)]>
                                                          </td>
                                                          </tr>
                                                          </table>
                                                          <![endif]-->
                                                      </td>
                                                  </tr>
                                              </table>
                                              <!--  END TEMPLATE -->
                                          </td>
                                      </tr>
                                  </table>
                              </center>
                          </body>
                      </html>`
                              });
                             return response
                            };
                       
                            const data1 = await run(tid);
                            console.log("data1",data1)
                           
                          
                            var sql = "UPDATE mailchimpTemplate SET content = '" + req.body.content +"', content1 = '" + req.body.content1 +"', content2 = '" + req.body.content2 +"', content3 = '" + req.body.content3 +"', content4 = '" + req.body.content4 +"', content5 = '" + req.body.content5 +"', content6 = '" + req.body.content6 +"', content7 = '" + req.body.content7 +"', content8 = '" + req.body.content8 +"', content9 = '" + req.body.content9 + "', content10 = '" + req.body.content10+"', content11 = '" + req.body.content11+"',imageId ='"+fileurldata.id+"',tempId ='"+data1.id+"', linkUrl = '" + req.body.url +"' WHERE cid = " + resultNew[0].cid + ";"
                           
                           conn.query(sql, async (err)=>{
                            if(err) {
                                return res.json({
                                    error:err
                                })
                            }else{
                               
                                res.json({
                                    msg:'data updated successfully!!!!!!!'
                                })
                            
                              }
                         })


                            }
  
                          
                        }
                    
                 })
              
             }
         })
      })
   })
 

router.get('/getAllTemplatenew/:userId',function (req, res) {
    req.getConnection((err, conn) => {
        
        //console.log("hello ji hi how",req.files[0])
        conn.query("SELECT * FROM users WHERE id = '" + req.params.userId + "';", async (err, result) => {
            if (err) {
                console.log(err);
                res.json({ "msg": "Error", "status": false })
            } else {
               
              // console.log("result",result);
              console.log("result[0]",result[0])

                mailchimp.setConfig({
                    apiKey: result[0].mailchimpApiKey,
                    server: result[0].mailchimpServer
                });


               const run = async () => {
                  const response = await mailchimp.templates.list();
                  console.log("here is response",response);
                  return response
                };
               
               const templateData = await run();
             //  console.log("/////////",templateData.templates)
                
                 var sql = "select * from mailchimpTemplate where uid = '"+result[0].id+"'";
                 conn.query(sql,(err,resultdata)=>{
                    if(err) throw err;
                    else if(resultdata.length>0){
                      //  console.log("resultdata",resultdata);
                      var arrayData = [];

                          resultdata.forEach((item,i)=>{
                            const mergerData = templateData.templates.filter((num)=>(
                                 num.id===item.tempId
                            ));
                            arrayData.push({mergerData:mergerData,dbData:item})
                        })
                       
                   
                        
                         
                         // function mergeArrayObjects(arr1,arr2){
                         //      return arr1.map((item,i)=>{
                         //           return Object.assign({},item,arr2[i])
                         //      })
                         //    }

                         // //   console.log("hello from third object",mergeArrayObjects(resultdata,templateData.templates));
                         //    const mergerData = mergeArrayObjects(resultdata,templateData.templates);

                        // res.json({
                        //   msg:'list of all templates',
                        //   dataa:mergerData,
                        // })
                        res.json({
                          msg:'list of all templates',
                          dataa:arrayData,
                        })
                    
                    }else{
                        console.log('no record found');
                        res.json({ "msgEmpty": "No Records Found" })
                    }
                 })

             }
         })
      })
   })

// get template data by id

router.get('/updateTemplatenew/:id/:uid',(req,res)=>{
    req.getConnection((err, conn) => {

     //   console.log("req.params.id",req.params.id)
     //   console.log("req.params.uid",req.params.uid)
        conn.query("SELECT * FROM users WHERE id = '" + req.params.uid + "';", async (err, result) => {
            if (err) {
                console.log(err);
                res.json({ "msg": "Error", "status": false })
            } else {     

                     var sql = "select * from mailchimpTemplate where cid='"+req.params.id+"'";
                        conn.query(sql, async (err,resultNew)=>{
                            if(err){
                                return res.json({
                                    msg:"something went wrong!!!!",
                                    error:err
                                })
                            }else{
                                 const IMGId = resultNew[0].imageId;
                               
                                 mailchimp.setConfig({
                                    apiKey: result[0].mailchimpApiKey,
                                    server: result[0].mailchimpServer
                                  });
                                 
                                 const run = async (IMGId) => {
                                  const response1 = await mailchimp.fileManager.getFile(IMGId);
                                   return response1
                                };
                           
                                 const datanew1 = await run(IMGId);
                                 console.log("asdfghjkllkjhgfdsa resultNew",datanew1)

                                  res.json({
                                        msg:'data get by id',
                                        dataaa:resultNew[0],
                                        imgURL:datanew1.full_size_url
                                    })   
                         
                        
                            }
                        })  
                                
                  
            }
       })

   })
})
    
router.post('/test', (req, res) => {
    // let [finalHtml] = [""]; 
    // process.exit(1);
    _readHTMLFile(path.join(__dirname, "../templates/test.html"), (err, html) => {
        console.log("html", html)
    });
    // console.log("hello world",finalHtml);

})


module.exports = router;