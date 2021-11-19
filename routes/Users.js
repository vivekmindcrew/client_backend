var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
var asyncLoop = require('node-async-loop');
const mailchimp = require("@mailchimp/mailchimp_marketing");
// const stripe = require('stripe')('sk_test_51HYfuZG5xGk5XWZSptLB8FqfABt59Ni4rEeNG6iMclN0CUuWKIH8gUibRrk4ilyVV6rrC7Q8kPZBQ8VsqB17UDXg00FADgIAiX')
const stripe = require('stripe')('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')
var base64 = require('base-64');
var utf8 = require('utf8');

var states = require('us-state-codes');


var nodemailer = require("nodemailer");
const { forEach } = require('async');
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    secure: false,
    auth: {
        user: "dev@clientconnect.ai",
        pass: 'Vivek4343'
    }
});


router.get('/', (req, res) => {
    res.send("Hello to login route");
});

router.post('/forgetPassword', (req, res) => {
    var reqObj = req.body;
    try {
        req.getConnection((err, conn) => {
            let query = conn.query("select * from users where email='" + reqObj.email + "'", (err, result) => {
                if (err) {
                    res.json({
                        "status": "false",
                        "msg": "something is wrong"
                    })
                } else {
                    if (JSON.parse(JSON.stringify(result)).length > 0) {
                        var email = result[0].email;

                        var userName = result[0].username;
                        // var userId = result[0].id;
                        var bytes = utf8.encode(email);
                        var encryptedString = base64.encode(bytes);

                        console.log(encryptedString)
                        var mailOptions = {
                            from: "dev@clientconnect.ai",
                            to: email,
                            subject: 'Reset your password',
                            html: `<!doctype html>
                            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:o="urn:schemas-microsoft-com:office:office">
                            
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
                                    p {
                                        margin: 10px 0;
                                        padding: 0;
                                    }
                            
                                    table {
                                        border-collapse: collapse;
                                    }
                            
                                    h1,
                                    h2,
                                    h3,
                                    h4,
                                    h5,
                                    h6 {
                                        display: block;
                                        margin: 0;
                                        padding: 0;
                                    }
                            
                                    img,
                                    a img {
                                        border: 0;
                                        height: auto;
                                        outline: none;
                                        text-decoration: none;
                                    }
                            
                                    body,
                                    #bodyTable,
                                    #bodyCell {
                                        height: 100%;
                                        margin: 0;
                                        padding: 0;
                                        width: 100%;
                                    }
                            
                                    .mcnPreviewText {
                                        display: none !important;
                                    }
                            
                                    #outlook a {
                                        padding: 0;
                                    }
                            
                                    img {
                                        -ms-interpolation-mode: bicubic;
                                    }
                            
                                    table {
                                        mso-table-lspace: 0pt;
                                        mso-table-rspace: 0pt;
                                    }
                            
                                    .ReadMsgBody {
                                        width: 100%;
                                    }
                            
                                    .ExternalClass {
                                        width: 100%;
                                    }
                            
                                    p,
                                    a,
                                    li,
                                    td,
                                    blockquote {
                                        mso-line-height-rule: exactly;
                                    }
                            
                                    a[href^=tel],
                                    a[href^=sms] {
                                        color: inherit;
                                        cursor: default;
                                        text-decoration: none;
                                    }
                            
                                    p,
                                    a,
                                    li,
                                    td,
                                    body,
                                    table,
                                    blockquote {
                                        -ms-text-size-adjust: 100%;
                                        -webkit-text-size-adjust: 100%;
                                    }
                            
                                    .ExternalClass,
                                    .ExternalClass p,
                                    .ExternalClass td,
                                    .ExternalClass div,
                                    .ExternalClass span,
                                    .ExternalClass font {
                                        line-height: 100%;
                                    }
                            
                                    a[x-apple-data-detectors] {
                                        color: inherit !important;
                                        text-decoration: none !important;
                                        font-size: inherit !important;
                                        font-family: inherit !important;
                                        font-weight: inherit !important;
                                        line-height: inherit !important;
                                    }
                            
                                    .templateContainer {
                                        max-width: 600px !important;
                                    }
                            
                                    a.mcnButton {
                                        display: block;
                                    }
                            
                                    .mcnImage,
                                    .mcnRetinaImage {
                                        vertical-align: bottom;
                                    }
                            
                                    .mcnTextContent {
                                        word-break: break-word;
                                    }
                            
                                    .mcnTextContent img {
                                        height: auto !important;
                                    }
                            
                                    .mcnDividerBlock {
                                        table-layout: fixed !important;
                                    }
                            
                                    /*
                                @tab Page
                                @section Heading 1
                                @style heading 1
                                */
                                    h1 {
                                        /*@editable*/
                                        color: #222222;
                                        /*@editable*/
                                        font-family: Helvetica;
                                        /*@editable*/
                                        font-size: 40px;
                                        /*@editable*/
                                        font-style: normal;
                                        /*@editable*/
                                        font-weight: bold;
                                        /*@editable*/
                                        line-height: 150%;
                                        /*@editable*/
                                        letter-spacing: normal;
                                        /*@editable*/
                                        text-align: center;
                                    }
                            
                                    /*
                                @tab Page
                                @section Heading 2
                                @style heading 2
                                */
                                    h2 {
                                        /*@editable*/
                                        color: #222222;
                                        /*@editable*/
                                        font-family: Helvetica;
                                        /*@editable*/
                                        font-size: 34px;
                                        /*@editable*/
                                        font-style: normal;
                                        /*@editable*/
                                        font-weight: bold;
                                        /*@editable*/
                                        line-height: 150%;
                                        /*@editable*/
                                        letter-spacing: normal;
                                        /*@editable*/
                                        text-align: left;
                                    }
                            
                                    /*
                                @tab Page
                                @section Heading 3
                                @style heading 3
                                */
                                    h3 {
                                        /*@editable*/
                                        color: #444444;
                                        /*@editable*/
                                        font-family: Helvetica;
                                        /*@editable*/
                                        font-size: 22px;
                                        /*@editable*/
                                        font-style: normal;
                                        /*@editable*/
                                        font-weight: bold;
                                        /*@editable*/
                                        line-height: 150%;
                                        /*@editable*/
                                        letter-spacing: normal;
                                        /*@editable*/
                                        text-align: left;
                                    }
                            
                                    /*
                                @tab Page
                                @section Heading 4
                                @style heading 4
                                */
                                    h4 {
                                        /*@editable*/
                                        color: #949494;
                                        /*@editable*/
                                        font-family: Georgia;
                                        /*@editable*/
                                        font-size: 20px;
                                        /*@editable*/
                                        font-style: italic;
                                        /*@editable*/
                                        font-weight: normal;
                                        /*@editable*/
                                        line-height: 125%;
                                        /*@editable*/
                                        letter-spacing: normal;
                                        /*@editable*/
                                        text-align: left;
                                    }
                            
                                    /*
                                @tab Header
                                @section Header Container Style
                                */
                                    #templateHeader {
                                        /*@editable*/
                                        background-color: #eeeeee;
                                        /*@editable*/
                                        background-image: none;
                                        /*@editable*/
                                        background-repeat: no-repeat;
                                        /*@editable*/
                                        background-position: center;
                                        /*@editable*/
                                        background-size: cover;
                                        /*@editable*/
                                        border-top: 0;
                                        /*@editable*/
                                        border-bottom: 0;
                                        /*@editable*/
                                        padding-top: 12px;
                                        /*@editable*/
                                        padding-bottom: 12px;
                                    }
                            
                                    /*
                                @tab Header
                                @section Header Interior Style
                                */
                                    .headerContainer {
                                        /*@editable*/
                                        background-color: transparent;
                                        /*@editable*/
                                        background-image: none;
                                        /*@editable*/
                                        background-repeat: no-repeat;
                                        /*@editable*/
                                        background-position: center;
                                        /*@editable*/
                                        background-size: cover;
                                        /*@editable*/
                                        border-top: 0;
                                        /*@editable*/
                                        border-bottom: 0;
                                        /*@editable*/
                                        padding-top: 0;
                                        /*@editable*/
                                        padding-bottom: 0;
                                    }
                            
                                    /*
                                @tab Header
                                @section Header Text
                                */
                                    .headerContainer .mcnTextContent,
                                    .headerContainer .mcnTextContent p {
                                        /*@editable*/
                                        color: #757575;
                                        /*@editable*/
                                        font-family: Helvetica;
                                        /*@editable*/
                                        font-size: 16px;
                                        /*@editable*/
                                        line-height: 150%;
                                        /*@editable*/
                                        text-align: left;
                                    }
                            
                                    /*
                                @tab Header
                                @section Header Link
                                */
                                    .headerContainer .mcnTextContent a,
                                    .headerContainer .mcnTextContent p a {
                                        /*@editable*/
                                        color: #007C89;
                                        /*@editable*/
                                        font-weight: normal;
                                        /*@editable*/
                                        text-decoration: underline;
                                    }
                            
                                    /*
                                @tab Body
                                @section Body Container Style
                                */
                                    #templateBody {
                                        /*@editable*/
                                        background-color: #FFFFFF;
                                        /*@editable*/
                                        background-image: none;
                                        /*@editable*/
                                        background-repeat: no-repeat;
                                        /*@editable*/
                                        background-position: center;
                                        /*@editable*/
                                        background-size: cover;
                                        /*@editable*/
                                        border-top: 0;
                                        /*@editable*/
                                        border-bottom: 0;
                                        /*@editable*/
                                        padding-top: 12px;
                                        /*@editable*/
                                        padding-bottom: 12px;
                                    }
                            
                                    /*
                                @tab Body
                                @section Body Interior Style
                                */
                                    .bodyContainer {
                                        /*@editable*/
                                        background-color: transparent;
                                        /*@editable*/
                                        background-image: none;
                                        /*@editable*/
                                        background-repeat: no-repeat;
                                        /*@editable*/
                                        background-position: center;
                                        /*@editable*/
                                        background-size: cover;
                                        /*@editable*/
                                        border-top: 0;
                                        /*@editable*/
                                        border-bottom: 0;
                                        /*@editable*/
                                        padding-top: 0;
                                        /*@editable*/
                                        padding-bottom: 0;
                                    }
                            
                                    /*
                                @tab Body
                                @section Body Text
                                */
                                    .bodyContainer .mcnTextContent,
                                    .bodyContainer .mcnTextContent p {
                                        /*@editable*/
                                        color: #757575;
                                        /*@editable*/
                                        font-family: Helvetica;
                                        /*@editable*/
                                        font-size: 16px;
                                        /*@editable*/
                                        line-height: 150%;
                                        /*@editable*/
                                        text-align: left;
                                    }
                            
                                    /*
                                @tab Body
                                @section Body Link
                                */
                                    .bodyContainer .mcnTextContent a,
                                    .bodyContainer .mcnTextContent p a {
                                        /*@editable*/
                                        color: #007C89;
                                        /*@editable*/
                                        font-weight: normal;
                                        /*@editable*/
                                        text-decoration: underline;
                                    }
                            
                                    /*
                                @tab Footer
                                @section Footer Style
                                */
                                    #templateFooter {
                                        /*@editable*/
                                        background-color: #eeeeee;
                                        /*@editable*/
                                        background-image: none;
                                        /*@editable*/
                                        background-repeat: no-repeat;
                                        /*@editable*/
                                        background-position: center;
                                        /*@editable*/
                                        background-size: cover;
                                        /*@editable*/
                                        border-top: 0;
                                        /*@editable*/
                                        border-bottom: 0;
                                        /*@editable*/
                                        padding-top: 0px;
                                        /*@editable*/
                                        padding-bottom: 0px;
                                    }
                            
                                    /*
                                @tab Footer
                                @section Footer Interior Style
                                */
                                    .footerContainer {
                                        /*@editable*/
                                        background-color: transparent;
                                        /*@editable*/
                                        background-image: none;
                                        /*@editable*/
                                        background-repeat: no-repeat;
                                        /*@editable*/
                                        background-position: center;
                                        /*@editable*/
                                        background-size: cover;
                                        /*@editable*/
                                        border-top: 0;
                                        /*@editable*/
                                        border-bottom: 0;
                                        /*@editable*/
                                        padding-top: 0;
                                        /*@editable*/
                                        padding-bottom: 0;
                                    }
                            
                                    /*
                                @tab Footer
                                @section Footer Text
                                */
                                    .footerContainer .mcnTextContent,
                                    .footerContainer .mcnTextContent p {
                                        /*@editable*/
                                        color: #FFFFFF;
                                        /*@editable*/
                                        font-family: Helvetica;
                                        /*@editable*/
                                        font-size: 12px;
                                        /*@editable*/
                                        line-height: 150%;
                                        /*@editable*/
                                        text-align: center;
                                    }
                            
                                    /*
                                @tab Footer
                                @section Footer Link
                                */
                                    .footerContainer .mcnTextContent a,
                                    .footerContainer .mcnTextContent p a {
                                        /*@editable*/
                                        color: #FFFFFF;
                                        /*@editable*/
                                        font-weight: normal;
                                        /*@editable*/
                                        text-decoration: underline;
                                    }
                            
                                    @media only screen and (min-width:768px) {
                                        .templateContainer {
                                            width: 600px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        body,
                                        table,
                                        td,
                                        p,
                                        a,
                                        li,
                                        blockquote {
                                            -webkit-text-size-adjust: none !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        body {
                                            width: 100% !important;
                                            min-width: 100% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnRetinaImage {
                                            max-width: 100% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnImage {
                                            width: 100% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        .mcnCartContainer,
                                        .mcnCaptionTopContent,
                                        .mcnRecContentContainer,
                                        .mcnCaptionBottomContent,
                                        .mcnTextContentContainer,
                                        .mcnBoxedTextContentContainer,
                                        .mcnImageGroupContentContainer,
                                        .mcnCaptionLeftTextContentContainer,
                                        .mcnCaptionRightTextContentContainer,
                                        .mcnCaptionLeftImageContentContainer,
                                        .mcnCaptionRightImageContentContainer,
                                        .mcnImageCardLeftTextContentContainer,
                                        .mcnImageCardRightTextContentContainer,
                                        .mcnImageCardLeftImageContentContainer,
                                        .mcnImageCardRightImageContentContainer {
                                            max-width: 100% !important;
                                            width: 100% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnBoxedTextContentContainer {
                                            min-width: 100% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnImageGroupContent {
                                            padding: 9px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        .mcnCaptionLeftContentOuter .mcnTextContent,
                                        .mcnCaptionRightContentOuter .mcnTextContent {
                                            padding-top: 9px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        .mcnImageCardTopImageContent,
                                        .mcnCaptionBottomContent:last-child .mcnCaptionBottomImageContent,
                                        .mcnCaptionBlockInner .mcnCaptionTopContent:last-child .mcnTextContent {
                                            padding-top: 18px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnImageCardBottomImageContent {
                                            padding-bottom: 9px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnImageGroupBlockInner {
                                            padding-top: 0 !important;
                                            padding-bottom: 0 !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcnImageGroupBlockOuter {
                                            padding-top: 9px !important;
                                            padding-bottom: 9px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        .mcnTextContent,
                                        .mcnBoxedTextContentColumn {
                                            padding-right: 18px !important;
                                            padding-left: 18px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        .mcnImageCardLeftImageContent,
                                        .mcnImageCardRightImageContent {
                                            padding-right: 18px !important;
                                            padding-bottom: 0 !important;
                                            padding-left: 18px !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                                        .mcpreview-image-uploader {
                                            display: none !important;
                                            width: 100% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Heading 1
                                @tip Make the first-level headings larger in size for better readability on small screens.
                                */
                                        h1 {
                                            /*@editable*/
                                            font-size: 30px !important;
                                            /*@editable*/
                                            line-height: 125% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Heading 2
                                @tip Make the second-level headings larger in size for better readability on small screens.
                                */
                                        h2 {
                                            /*@editable*/
                                            font-size: 26px !important;
                                            /*@editable*/
                                            line-height: 125% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Heading 3
                                @tip Make the third-level headings larger in size for better readability on small screens.
                                */
                                        h3 {
                                            /*@editable*/
                                            font-size: 20px !important;
                                            /*@editable*/
                                            line-height: 150% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Heading 4
                                @tip Make the fourth-level headings larger in size for better readability on small screens.
                                */
                                        h4 {
                                            /*@editable*/
                                            font-size: 18px !important;
                                            /*@editable*/
                                            line-height: 150% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Boxed Text
                                @tip Make the boxed text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                                */
                                        .mcnBoxedTextContentContainer .mcnTextContent,
                                        .mcnBoxedTextContentContainer .mcnTextContent p {
                                            /*@editable*/
                                            font-size: 14px !important;
                                            /*@editable*/
                                            line-height: 150% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Header Text
                                @tip Make the header text larger in size for better readability on small screens.
                                */
                                        .headerContainer .mcnTextContent,
                                        .headerContainer .mcnTextContent p {
                                            /*@editable*/
                                            font-size: 16px !important;
                                            /*@editable*/
                                            line-height: 150% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Body Text
                                @tip Make the body text larger in size for better readability on small screens. We recommend a font size of at least 16px.
                                */
                                        .bodyContainer .mcnTextContent,
                                        .bodyContainer .mcnTextContent p {
                                            /*@editable*/
                                            font-size: 16px !important;
                                            /*@editable*/
                                            line-height: 150% !important;
                                        }
                            
                                    }
                            
                                    @media only screen and (max-width: 480px) {
                            
                                        /*
                                @tab Mobile Styles
                                @section Footer Text
                                @tip Make the footer content text larger in size for better readability on small screens.
                                */
                                        .footerContainer .mcnTextContent,
                                        .footerContainer .mcnTextContent p {
                                            /*@editable*/
                                            font-size: 14px !important;
                                            /*@editable*/
                                            line-height: 150% !important;
                                        }
                            
                                    }
                                </style>
                            </head>
                            
                            <body>
                             
                                <center>
                                    <table align="center" border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="bodyTable">
                                        <tr>
                                            <td align="center" valign="top" id="bodyCell">
                                                <!-- BEGIN TEMPLATE // -->
                                                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                                    <tr>
                                                        <td align="center" valign="top" id="templateHeader" data-template-container>
                                                            <!--[if (gte mso 9)|(IE)]>
                                                                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600" style="width:600px;">
                                                                <tr>
                                                                <td align="center" valign="top" width="600" style="width:600px;">
                                                                <![endif]-->
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                class="templateContainer">
                                                                <tr>
                                                                    <td valign="top" class="headerContainer">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                            class="mcnImageBlock" style="min-width:100%;">
                                                                            <tbody class="mcnImageBlockOuter">
                                                                                <tr>
                                                                                    <td valign="top" style="padding:0px" class="mcnImageBlockInner">
                                                                                        <table align="left" width="100%" border="0" cellpadding="0"
                                                                                            cellspacing="0" class="mcnImageContentContainer"
                                                                                            style="min-width:100%;">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td class="mcnImageContent" valign="top"
                                                                                                        style="padding-right: 0px; padding-left: 0px; padding-top: 0; padding-bottom: 0; text-align:center;">
                            
                            
                                                                                                        <img align="center" alt=""
                                                                                                            src="https://mcusercontent.com/b333225b7e67c12fb771f4788/images/e294f022-48d8-498d-abb3-57156c8e48ee.png"
                                                                                                            width="474"
                                                                                                            style="max-width: 1923px; padding-bottom: 0px; vertical-align: bottom; display: inline !important; border-radius: 0%;"
                                                                                                            class="mcnImage">
                            
                            
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
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
                                                            <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                class="templateContainer">
                                                                <tr>
                                                                    <td valign="top" class="bodyContainer">
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                            class="mcnBoxedTextBlock" style="min-width:100%;">
                                                                            <!--[if gte mso 9]>
                                <table align="center" border="0" cellspacing="0" cellpadding="0" width="100%">
                                <![endif]-->
                                                                            <tbody class="mcnBoxedTextBlockOuter">
                                                                                <tr>
                                                                                    <td valign="top" class="mcnBoxedTextBlockInner">
                            
                                                                                        <!--[if gte mso 9]>
                                            <td align="center" valign="top" ">
                                            <![endif]-->
                                                                                        <table align="left" border="0" cellpadding="0"
                                                                                            cellspacing="0" width="100%" style="min-width:100%;"
                                                                                            class="mcnBoxedTextContentContainer">
                                                                                            <tbody>
                                                                                                <tr>
                            
                                                                                                    <td
                                                                                                        style="padding-top:9px; padding-left:18px; padding-bottom:9px; padding-right:18px;">
                            
                                                                                                        <table border="0" cellspacing="0"
                                                                                                            class="mcnTextContentContainer"
                                                                                                            width="100%"
                                                                                                            style="min-width: 100% !important;background-color: #EEEEEE;">
                                                                                                            <tbody>
                                                                                                                <tr>
                                                                                                                    <td valign="top"
                                                                                                                        class="mcnTextContent"
                                                                                                                        style="padding: 18px;color: #3E5B77;font-family: Helvetica;font-size: 14px;font-weight: normal;text-align: center;">
                                                                                                                        <div
                                                                                                                            style="text-align: center;">
                                                                                                                            <span
                                                                                                                                style="font-size:18px"><strong>Hi ${userName},</strong></span>
                            
                                                                                                                            <hr>
                                                                                                                            <table border="0"
                                                                                                                                cellpadding="0"
                                                                                                                                cellspacing="0"
                                                                                                                                role="presentation"
                                                                                                                                width="100%">
                                                                                                                                <tbody>
                                                                                                                                    <tr>
                                                                                                                                        <td
                                                                                                                                            align="left">
                                                                                                                                            &nbsp;
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                    <tr>
                                                                                                                                        <td
                                                                                                                                            align="left">
                                                                                                                                            You
                                                                                                                                            recently
                                                                                                                                            requested
                                                                                                                                            a
                                                                                                                                            password
                                                                                                                                            change
                                                                                                                                            for your
                                                                                                                                            Client
                                                                                                                                            Connect
                                                                                                                                            account.&nbsp;<br>
                                                                                                                                            &nbsp;
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                    <tr>
                                                                                                                                        <td
                                                                                                                                            align="left">
                                                                                                                                            If you
                                                                                                                                            did not
                                                                                                                                            request
                                                                                                                                            this
                                                                                                                                            change,
                                                                                                                                            please
                                                                                                                                            contact
                                                                                                                                            us
                                                                                                                                            immediately
                                                                                                                                            at
                                                                                                                                            team@clientconnect.ai.&nbsp;Please
                                                                                                                                            note we
                                                                                                                                            will
                                                                                                                                            never
                                                                                                                                            ask for
                                                                                                                                            your
                                                                                                                                            password
                                                                                                                                            over
                                                                                                                                            email or
                                                                                                                                            phone.&nbsp;
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                    <tr>
                                                                                                                                        <td
                                                                                                                                            align="left">
                                                                                                                                            &nbsp;
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                    <tr>
                                                                                                                                        <td
                                                                                                                                            align="left">
                                                                                                                                            &nbsp;
                                                                                                                                        </td>
                                                                                                                                    </tr>
                                                                                                                                    <tr>
                                                                                                                                        <td
                                                                                                                                            align="left">
                                                                                                                                            Sincerely,<br>
                                                                                                                                            Client
                                                                                                                                            Connect
                                                                                                                                            LLC</td>
                                                                                                                                    </tr>
                                                                                                                                </tbody>
                                                                                                                            </table>
                                                                                                                        </div>
                            
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            </tbody>
                                                                                                        </table>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
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
                                                                        </table>
                                                                        <table border="0" cellpadding="0" cellspacing="0" width="100%"
                                                                            class="mcnButtonBlock" style="min-width:100%;">
                                                                            <tbody class="mcnButtonBlockOuter">
                                                                                <tr>
                                                                                    <td style="padding-top:0; padding-right:18px; padding-bottom:18px; padding-left:18px;"
                                                                                        valign="top" align="center" class="mcnButtonBlockInner">
                                                                                        <table border="0" cellpadding="0" cellspacing="0"
                                                                                            class="mcnButtonContentContainer"
                                                                                            style="border-collapse: separate !important;border-radius: 50px;background-color: #3E5B77;">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td align="center" valign="middle"
                                                                                                        class="mcnButtonContent"
                                                                                                        style="font-family: Roboto, &quot;Helvetica Neue&quot;, Helvetica, Arial, sans-serif; font-size: 14px; padding: 15px;">
                                                                                                        <a class="mcnButton "
                                                                                                            title="Change Password"
                                                                                                            href="https://www.clientconnect.ai/Subscription/#/resetpassword/${encryptedString}"
                                                                                                            target="_blank"
                                                                                                            style="font-weight: bold;letter-spacing: -0.5px;line-height: 100%;text-align: center;text-decoration: none;color: #FFFFFF;">Change
                                                                                                            Password</a>
                                                                                                    </td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </table>
                                                                                    </td>
                                                                                </tr>
                                                                            </tbody>
                                                                        </table>
                                                                    </td>
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
                                                <!-- // END TEMPLATE -->
                                            </td>
                                        </tr>
                                    </table>
                                </center>
                            </body>
                            
                            </html>`,
                          }

                        transporter.sendMail(mailOptions, function (error, response) {
                            if (error) {
                                console.log(error)
                                res.json({
                                    "status": "false", "msg": 'An email error !', "err": error
                                });
                            } else {
                                res.json({ "status": "true", "message": "Please check your email for instructions." })
                            }
                        });
                    } else {
                        res.json({ "status": "false", "message": "This email is not registered with Client Connect." })
                    }
                }
            })
        })

    } catch (err) {
        console.log(err);
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});

router.post('/submitPassword', (req, res) => {
    try {
        var reqObj = req.body
        // const decryptedString = cryptr.decrypt(reqObj.email);
        console.log(reqObj)
        var bytes = base64.decode(reqObj.id);
        var text = utf8.decode(bytes);
        console.log(text);

        req.getConnection((err, conn) => {
            let query = conn.query("select * from users where email='" + text + "'", async (err, result) => {
                if (err) {
                    res.json({
                        "status": "false",
                        "message": "Something is wrong"
                    })
                } else {
                    if (JSON.parse(JSON.stringify(result)).length > 0) {
                        const salt = await bcrypt.genSalt();
                        const hashedPassword = await bcrypt.hash(reqObj.password, salt);
                        conn.query("update users set password='" + hashedPassword + "' where email='" + text + "'", (err, result) => {
                            if (err) {
                                res.json({
                                    "status": "false",
                                    "message": "something is wrong"
                                })
                            } else {
                                res.json({
                                    "status": "true",
                                    "message": "Password successfully changed!"
                                })
                            }
                        })
                    } else {
                        res.json({
                            "status": "false",
                            "message": "This email is not registered with Client Connect!"
                        })
                    }
                }
            })
        })
    } catch (err) {
        console.log(err)
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});


router.post('/login', async (req, res) => {
    let reqObj = req.body;
    console.log(req.body);
    try {
        console.log("select * from users where email='" + reqObj.email + "';")
        req.getConnection((err, conn) => {

            let query = conn.query("select * from users where email='" + reqObj.email + "';", (err, result) => {
                if (err) {
                    console.log("err", err)
                    res.json({
                        "err": err,
                        "msg": "something is wrong"
                    })
                } else {
                    console.log(result);

                    if (result.length > 0) {
                        if (result[0].email === reqObj.email) {
                            bcrypt.compare(reqObj.password, result[0].password, function (err, bycResult) {
                                if (bycResult === true) {
                                    console.log("Matched true");
                                    if (result[0].email === 'admin@gmail.com') {
                                        console.log('admin')
                                        res.json({
                                            status: "true",
                                            response: result,
                                            email: result[0].email,
                                            user: 'admin'
                                        })
                                    }
                                    else {
                                        checkSubscriptionFun(conn, result[0].id)
                                            .then((subsChecked) => {
                                                conn.query("SELECT countypractice FROM subscribedCounties WHERE userid='" + result[0].id +
                                                    "' AND isSubscribed = 1 ORDER BY countypractice asc;", function (err, countiesName) {
                                                        if (err) throw err;
                                                        else {
                                                            if (countiesName.length < 0) {
                                                                res.json({
                                                                    status: "true",
                                                                    response: result,
                                                                    email: result[0].email,
                                                                    password: result[0].password,
                                                                    subscribedCounty: [],
                                                                    firmname: result[0].firmname
                                                                })
                                                            } else {
                                                                res.json({
                                                                    status: "true",
                                                                    response: result,
                                                                    email: result[0].email,
                                                                    password: result[0].password,
                                                                    subscribedCounty: countiesName,
                                                                    firmname: result[0].firmname,
                                                                    mailchimpApiKey: result[0].mailchimpApiKey
                                                                })
                                                            }
                                                        }
                                                    });
                                            })
                                            .catch((err) => {
                                                res.json({
                                                    status: "true",
                                                    response: result,
                                                    email: result[0].email,
                                                    password: result[0].password,
                                                    subscribedCounty: [],
                                                    firmname: result[0].firmname
                                                })
                                            });
                                    }

                                }
                                else {
                                    res.json({
                                        status: "false",
                                        msg: "Password is incorrect"
                                    })
                                }
                            })
                        } else {
                            res.json({
                                status: "false",
                                msg: "Email is incorrect"
                            })
                        }
                    } else {
                        res.json({
                            status: "false",
                            msg: "User not registered"
                        })
                    }
                }
            })
        })
    } catch (err) {
        console.log(err)
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});

function checkSubscriptionFun(conn, userid) {
    // router.post("/checkSub", (req, res) => {
    // var userid = req.body.userid;
    var activeCountyArr = [];
    // req.getConnection((err, conn)=>{
    return new Promise((resolve, reject) => {
        conn.query("SELECT * FROM subscribedCounties WHERE userid = '" + userid + "';", (err, countyName) => {
            if (err) {
                console.log("err");
                reject()
            }
            else {

                asyncLoop(countyName, (coName, next) => {
                    stripe.subscriptions.retrieve(coName.subId)
                        .then((resu) => {
                            if (resu.status === 'active') {
                                conn.query("UPDATE subscribedCounties SET isSubscribed = 1 WHERE id = " + coName.id + ";",
                                    (err, deleteResult) => {
                                        if (err) {
                                            console.log("err");
                                        }
                                        else {
                                            activeCountyArr.push(coName.id);
                                        }
                                    })
                            }
                            else {
                                conn.query("UPDATE subscribedCounties SET isSubscribed = 0 WHERE id = " + coName.id + ";",
                                    (err, deleteResult) => {
                                        if (err) {
                                            console.log("err");
                                        }
                                        else {
                                            console.log(resu.status, "Subscribed false", coName.id);
                                        }
                                    })
                            }
                            next();
                        })
                        .catch((err) => {
                            next();
                        });
                }, function (err) {
                    if (err) {
                        console.log(err);
                        reject({ "err": err, "status": false });
                    }
                    resolve({ "status": activeCountyArr });
                    // res.json({"status": activeCountyArr});
                })
            }
        })
    })
}
router.post("/leads", (req, res) => {

    let countyName = req.body.countyName;
    let thirtyDays = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    try {
        req.getConnection((err, conn) => {
            // conn.query("select * from leads where date>'"+thirtyDays+"' order by date desc;", (err, result) => {
            conn.query("select * from subscribedCounties where userid ='" + req.body.userId + "' and countypractice='"
                + countyName + "' and isSubscribed = 1;", (err, checkSubscribed) => {
                    if (err) {
                        console.log(err);
                        res.json({
                            status: "false",
                            "err": err,
                            "msg": "something is wrong"
                        })
                    } else {
                        if (checkSubscribed.length > 0) {
                            conn.query("select * from leads where date>'" + thirtyDays + "' and county='" + countyName
                                + "' order by date desc;", (err, result) => {
                                    if (err) {
                                        console.log(err);
                                        res.json({
                                            status: "false",
                                            "err": err,
                                            "msg": "something is wrong"
                                        })
                                    } else {
                                        res.json({
                                            status: "true",
                                            response: result
                                        })
                                    }
                                })
                        } else {
                            res.json({
                                status: "false",
                                "msg": "Please Subscribed"
                            })
                        }
                    }
                })
        })
    } catch (err) {
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});

router.post("/leadsDownload", (req, res) => {
    try {
        let date = new Date().toISOString().slice(0, 10)
        let sevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        let aMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        if (req.body.day === 1) {

            req.getConnection((err, conn) => {
                conn.query("select fn, ln, Charge, age, email, email2, email3, phone, date, county from leads where date='" + date +
                    "'and county='" + req.body.county + "' and county in (select countypractice from subscribedCounties where userid='" + req.body.currentUserId + "' and isSubscribed = 1) order by date desc;", (err, result) => {
                        if (err) {
                            res.json({
                                status: "false",
                                "err": err,
                                "msg": "something is wrong"
                            })
                        } else {
                            if (result.length <= 0) {
                                res.json({
                                    status: "false",
                                    "msg": "No lead found"
                                })
                            }
                            else {
                                var i;
                                let j = 0;
                                var arr = [];
                                for (i = 0; i < result.length; i++) {
                                    var stateName = result[i].county.split(",");
                                    var stateCode = states.getStateCodeByStateName(stateName[1]);
                                    if (result[i].email) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++;
                                    }
                                    if (result[i].email2) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email2,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++
                                    }
                                    if (result[i].email3) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email3,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++
                                    }
                                }
                                res.json({
                                    status: "true",
                                    response: arr
                                })
                            }

                        }
                    })
            })
        } else if (req.body.day === 7) {
            req.getConnection((err, conn) => {
                conn.query("select fn, ln, Charge, age, email, email2, email3, phone, date, county from leads where date>'" + sevenDays
                    + "' and date<='" + date +
                    "'and county='" + req.body.county + "'and county in (select countypractice from subscribedCounties where userid='" + req.body.currentUserId + "' and isSubscribed = 1) order by date desc;", (err, result) => {
                        if (err) {
                            res.json({
                                status: "false",
                                "err": err,
                                "msg": "something is wrong"
                            })
                        } else {
                            if (result.length <= 0) {
                                res.json({
                                    status: "false",
                                    "msg": "No lead found"
                                })
                            }
                            else {
                                var i;
                                let j = 0;
                                var arr = [];
                                for (i = 0; i < result.length; i++) {
                                    var stateName = result[i].county.split(",");
                                    var stateCode = states.getStateCodeByStateName(stateName[1]);
                                    if (result[i].email) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++;
                                    }
                                    if (result[i].email2) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email2,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++
                                    }
                                    if (result[i].email3) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email3,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++
                                    }
                                }
                                res.json({
                                    status: "true",
                                    response: arr
                                })
                            }

                        }
                    })
            })
        } else if (req.body.day === 30) {
            req.getConnection((err, conn) => {
                conn.query("select fn, ln, Charge, age, email, email2, email3, phone, date, county from leads where date>'" + aMonth + "' and date<='" + date +
                    "' and county='" + req.body.county + "' and county in (select countypractice from subscribedCounties where userid='" + req.body.currentUserId + "' and isSubscribed = 1) order by date desc;", (err, result) => {
                        if (err) {
                            console.log(err);
                            res.json({
                                status: "false",
                                "err": err,
                                "msg": "something is wrong"
                            })
                        } else {
                            if (result.length <= 0) {
                                res.json({
                                    status: "false",
                                    "msg": "No lead found"
                                })
                            }
                            else {
                                var i;
                                let j = 0;
                                var arr = [];
                                for (i = 0; i < result.length; i++) {
                                    var stateName = result[i].county.split(",");
                                    var stateCode = states.getStateCodeByStateName(stateName[1]);
                                    if (result[i].email) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++;
                                    }
                                    if (result[i].email2) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email2,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++
                                    }
                                    if (result[i].email3) {
                                        arr[j] = {
                                            fn: result[i].fn,
                                            ln: result[i].ln,
                                            Charge: result[i].Charge,
                                            age: result[i].age,
                                            email: result[i].email3,
                                            phone: result[i].phone,
                                            state: stateCode,
                                            date: result[i].date,
                                        }
                                        j++
                                    }
                                }
                                res.json({
                                    status: "true",
                                    response: arr
                                })
                            }
                        }
                    })
            })
        }
    } catch (err) {
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});

router.post('/getTileData', (req, res) => {
    try {
        let countyName = req.body.countyName;
        let date = new Date().toISOString().slice(0, 10);
        let sevenDays = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        console.log(req.body);
        req.getConnection((err, conn) => {
            console.log('1');
            conn.query("select count(date) as count from leads where county='" + countyName + "' and date>'"
                + sevenDays + "' and date<='" + date + "';", (err, result) => {
                    if (err) { 
                        res.json({
                            status: "false",
                            "err": err,
                            "msg": "something is wrong"
                        })
                    } else {
                             conn.query("select Charge, count(Charge) as topCharge from leads where county='" + countyName + "' and date>'" + sevenDays + "' and date<='" +
                                date + "' group by Charge order by count(Charge) desc limit 1;", (err, result1) => {
                                    if (err) {
                                        res.json({
                                            status: "false",
                                            "err": err,
                                            "msg": "something is wrong"
                                        })
                                    } else {
                                        console.log('2', result1.length);

                                        if (result1.length > 0) {
                                            res.json({
                                                status: "true",
                                                responseLeads: result,
                                                responseCharge: result1
                                            })
                                        }
                                        else {
                                            res.json({
                                                status: "true",
                                                responseLeads: result,
                                                responseCharge: result1
                                            })
                                        }

                                    }
                                })
                     }
                })
        })

    } catch (err) {
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});

router.get('/getDemoleads', function (req, res, next) {
    try {
        req.getConnection((err, conn) => {
            conn.query("SELECT * FROM demoLeads", function (err, result, fields) {
                if (err) throw err;
                else {
                    res.send({ data: result, status: true });
                }
            });
        })
    } catch (err) {
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
});

router.post('/addNewCounty', function (req, res) {

    var reqObj = req.body;
    var listId;
    var count = 0;
    try {
        req.getConnection((err, conn) => {
            console.log(err);
            conn.query("select * from subscribedCounties where userid='" + reqObj.userId + "' and countypractice = '" + reqObj.countypractice + "';", (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({
                        "err": err,
                        "msg": "something is wrong"
                    })
                } else {
                    if (result.length > 0) {
                        // asyncLoop(result, (element, next) => {
                        if (result[0].isSubscribed == 1) {
                            res.json({
                                status: "false",
                                msg: "This County is already Subscribed"
                            })
                            // next();
                        }
                        else if (result[0].isSubscribed == 0) {
                            res.json({
                                status: "false",
                                msg: "This County is already added but you have cancel subscription"
                            })

                        }
                        else if (result[0].isSubscribed === null) {
                            conn.query("DELETE FROM subscribedCounties WHERE userid='" + reqObj.userId + "' and countypractice = '" + reqObj.countypractice + "';", (err, dltResult) => {
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        "err": err,
                                        "msg": "something is wrong"
                                    })
                                } else {
                                    addCountyFun(reqObj, conn).then((resl) => {
                                        console.log(resl);
                                        res.json(resl);
                                    });
                                }
                            })
                        }
                        else {
                            res.json({
                                "err": err,
                                "msg": "something is wrong",
                                status: false
                            })
                        }

                    } else {
                        console.log("New county");
                        addCountyFun(reqObj, conn).then((resl) => {
                            console.log(resl);
                            res.json(resl);
                        });
                    }
                }
            })
        })
    } catch (err) {
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
})

var addCountyFun = function (reqObj, conn) {
    return new Promise((resolve, reject) => {
        conn.query("insert into subscribedCounties(userid, countypractice) values('" + reqObj.userId + "','" + reqObj.countypractice + "');", (err, result) => {
            if (err) {
                console.log(err);
                reject({
                    "err": err,
                    "msg": "something is wrong"
                })
            } else {
                conn.query("SELECT * FROM users WHERE id = '" + reqObj.userId + "';", (err, leadRes) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (leadRes.length > 0) {

                            if (leadRes[0].mailchimpApiKey !== null) {
                                listId = leadRes[0].mailChimpAudienceId;
                                var mailchimpApiKey = leadRes[0].mailchimpApiKey;
                                var mailchimpServer = leadRes[0].mailchimpServer;
                                var query = "SELECT * FROM leads WHERE county = '" + reqObj.countypractice +
                                    "' and date >= (SELECT mailchimpKeyDate FROM users where id = '"
                                    + reqObj.userId + "');"
                                fetchLead(query, conn, listId, mailchimpApiKey, mailchimpServer).then((fetchresult) => {
                                    console.log("Lead synced on adding contact", fetchresult);
                                })
                                resolve({
                                    "status": true,
                                    "msg": "Lead synced"
                                })
                            }
                            else {
                                // console.log("User is not subscribed to mailchimp");
                                resolve({
                                    status: true,
                                    "msg": "User is not subscribed to mailchimp",
                                })
                            }

                        } else {
                            reject({
                                "status": false,
                                "msg": "User is not found"
                            })
                        }
                    }
                })
            }
        })
    });
}
router.post('/getAllCounty', function (req, res) {
    var reqObj = req.body;
    try {
        req.getConnection((err, conn) => {
            conn.query("select * from subscribedCounties where userid='" + reqObj.userId + "' and isSubscribed = 1;", (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({
                        "err": err,
                        "msg": "something is wrong"
                    })
                } else {
                    if (result.length > 0) {
                        res.json({
                            status: true,
                            msg: "successfully fetched county names",
                            data: result
                        })
                    } else {
                        res.json({
                            status: false,
                            msg: "no county subscribed",
                            data: []
                        })
                    }
                }
            })

        })
    } catch (err) {
        res.json({
            "err": err,
            "msg": "something is wrong"
        })
    }
})

router.post('/getCharges', function(req, res){
    try {
        req.getConnection((err, conn) => {
            conn.query("SELECT DISTINCT Charge FROM leads;", (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({
                        "err": err,
                        "msg": "something is wrong"
                    })
                } else {
                    res.json({
                        data:result,
                        status:true
                    })
                }
            })
        })
    }
    catch{
        res.json({
            "err": "err",
            "msg": "something is wrong"
        })
    }      
})

// router.post('/addCharges', function(req, res){
//     var reqObj = req.body;
//     try {
//         req.getConnection((err, conn) => {
//             conn.query("SELECT * FROM subscribedCounties WHERE userid='" + reqObj.userId + "';", (err, result) => {
//                 if (err) {
//                     console.log(err);
//                     res.json({
//                         "err": err,
//                         "msg": "something is wrong"
//                     })
//                 } else {
//                     if(result.length > 0){
//                         conn.query("UPDATE chargeList SET'" + reqObj.charges + "' WHERE  userid='" + reqObj.userId + "';", (err, result) => {
//                             if (err) {
//                                 console.log(err);
//                                 res.json({
//                                     "err": err,
//                                     "msg": "something is wrong"
//                                 })
//                             } else {
//                     }
//                     res.json({
//                         data:result,
//                         status:true
//                     })
//                 }
//             })
//         })
//     }
//     catch{
//         res.json({
//             "err": "err",
//             "msg": "something is wrong"
//         })
//     }      
// })

router.post('/logout', function (req, res) {
    let today = new Date(Date.now()).toISOString().slice(0, 10);
    req.getConnection((err, conn) => {
        conn.query("UPDATE users SET lastLogin = '" + today + "' WHERE id='" + req.body.userId +
            "';", function (err, loginUpdateResult) {
                if (err) throw err;
                else {
                    res.json({ "msg": "Last Login date is set successfully!", "status": true })
                }
            })
    })
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
            var len = leadRes.length;
            if (len > 0) {
                asyncLoop(leadRes, function (leadElement, next) {
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
                // console.log("No new lead found.");
                return;
            }
        }
    })
};

module.exports = router;