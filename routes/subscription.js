var express = require('express');
var router = express.Router();
// const stripe = require('stripe')('sk_test_51HYfuZG5xGk5XWZSptLB8FqfABt59Ni4rEeNG6iMclN0CUuWKIH8gUibRrk4ilyVV6rrC7Q8kPZBQ8VsqB17UDXg00FADgIAiX')
const stripe = require('stripe')('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')

const stripController = require('../controllers/stripe');
var bcrypt = require('bcrypt');
var zipcodes = require('zipcodes');


/*******************************Subscriptions **********************************/
router.get('/', (req, res) => {
    var hills = zipcodes.lookup(98101);
    console.log(hills)
})
router.post('/stripe/listOfPlans', stripController.listOfPlans);

router.post('/createcustomer', async function (req, res) {

    var first = req.body.first;
    var last = req.body.last;
    var email = req.body.email;
    var name = first + " " + last;
    // var password=req.body.password;
    let reqObj = req.body;
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(reqObj.password, salt);
        console.log(reqObj.password, salt, hashedPassword,"saaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        req.getConnection((err, conn) => {
            conn.query("select * from users where email='" + reqObj.email + "';", (err, result) => {
                if (err) {
                    res.json({
                        "err": err,
                        "msg": "something is wrong"
                    })
                    console.log(err);
                } else {
                    if (result.length > 0) {
                        conn.query("select * from subscribedCounties where userid='" + result[0].id + "';", (err, subRes) => {
                            if (err) {
                                console.log(err);
                                res.json({
                                    "err": err,
                                    "msg": "something is wrong"
                                })
                            } else {
                                console.log("County found", subRes);
                                if (subRes.length > 0) {
                                    // asyncLoop(subRes, (element, next) => {
                                    if (subRes[0].isSubscribed == 1) {
                                        console.log("This County is already Subscribed");
                                        res.json({
                                            status: "false",
                                            msg: "Email already registered"
                                        })
                                        // next();
                                    }
                                    else if (subRes[0].isSubscribed == 0) {
                                        res.json({
                                            status: "false",
                                            msg: "Email already registered"
                                        })

                                    }
                                    else if (subRes[0].isSubscribed === null) {
                                        console.log("Old User");
                                        conn.query("UPDATE users SET username = '"+name +"', password = '"+hashedPassword +
                                        "', countypractice= '"+reqObj.countypractice +"', firmname= '"+reqObj.firmname +"', barid= '"+reqObj.barid  
                                        +  "' WHERE email = '" + email + "';", (err, result) => {
                                            if (err) {
                                                console.log(err)
                                                res.json({
                                                    "err": err,
                                                    "msg": "something is wrong"
                                                })
                                            } else {
                                                conn.query("select * from users where email='" + reqObj.email + "';", (err, insssResult) => {
                                                    if (err) {
                                                        res.json({
                                                            "err": err,
                                                            "msg": "something is wrong"
                                                        })
                                                        console.log(err);
                                                    } else {
                                                        console.log(insssResult, insssResult[0], insssResult[0].customerId, insssResult[0].id,"insssResult");
                                                        if (insssResult.length > 0) {
                                                            res.json({ status: "true", "customerid": insssResult[0].customerId, response: insssResult, id: insssResult[0].id })
                                                        }
                                                        else{
                                                            res.json({
                                                                "err": err,
                                                                "msg": "something is wrong"
                                                            })
                                                        }
                                                    }
                                                })
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

                                }
                                else{
                                    console.log("Old User");
                                    conn.query("UPDATE users SET username = '"+name +"', password = '"+hashedPassword +
                                    "', countypractice= '"+reqObj.countypractice +"', firmname= '"+reqObj.firmname +"', barid= '"+reqObj.barid  
                                    +  "' WHERE email = '" + email + "';", (err, result) => {
                                        if (err) {
                                            console.log(err)
                                            res.json({
                                                "err": err,
                                                "msg": "something is wrong"
                                            })
                                        } else {
                                            conn.query("select * from users where email='" + reqObj.email + "';", (err, insResult) => {
                                                if (err) {
                                                    res.json({
                                                        "err": err,
                                                        "msg": "something is wrong"
                                                    })
                                                    console.log(err);
                                                } else {
                                                    console.log(insResult, insResult[0], insResult[0].username,"insResult");
                                                    if (insResult.length > 0) {
                                                        res.json({ status: "true", "customerid": insResult[0].customerId, response: insResult, id: insResult[0].id })
                                                    }
                                                    else{
                                                        res.json({
                                                            "err": err,
                                                            "msg": "something is wrong"
                                                        })
                                                    }
                                                }
                                            })
                                        }
                                    })
                                 }
                            }                                
                        })
                    }
                    else {
                        stripe.customers.create(
                            {
                                name: name,
                                email: email,
                                address: { "country": "US" },
                            },
                            function (err, customer) {
                                if (err) {
                                    console.log(err)
                                    res.send({ "status": false, "error": err })
                                }
                                else {
                                    console.log("Customer", customer);
                                    req.getConnection((err, conn) => {
                                        conn.query("insert into users(username, password, email, countypractice, firmname, barid, customerId) values('" + name + "','" + hashedPassword + "','" + reqObj.email + "','" + reqObj.countypractice + "','" + reqObj.firmname + "','" + reqObj.barid + "','" + customer.id + "');", (err, result) => {
                                            if (err) {
                                                console.log(err)
                                                res.json({
                                                    "err": err,
                                                    "msg": "something is wrong"
                                                })
                                            } else {
                                                console.log(result.insertId);
                                                res.json({ status: "true", "customerid": customer.id, response: result, id: result.insertId })
                                            }
                                        })
                                    })
                                }
                            }
                        );
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
router.post('/addcard', function (req, res) {
    var reqObj = req.body;
    var card_no = req.body.card_no;
    var exp_month = req.body.exp_month;
    var exp_year = req.body.exp_year;
    var cvc = req.body.cvc;
    var customer_id = req.body.customer_id;
    var price_id = req.body.price_id;
    var code = req.body.coupon;
    var country = zipcodes.lookup(reqObj.postal_code);
    console.log("addcard user id", req.body, req.body.countyName);
    // var password=req.body.password;
    stripe.tokens.create(
        {
            card: {
                name: reqObj.cName,
                number: card_no,
                exp_month: exp_month,
                exp_year: exp_year,
                cvc: cvc,
                address_line1: reqObj.address, 
                address_city: reqObj.city,
                address_state: reqObj.state,
                address_zip: reqObj.postal_code,
                address_country: country.country
            },
        },
        function (err, token) {
            if (err) {
                console.log(err);
                res.send({ "status": false, "error": err })
            }
            else {
                //   res.send(token)
                stripe.customers.createSource(
                    customer_id,
                    { source: token.id },
                    function (err, card) {
                        if (err) {
                            console.log("1", err)
                            res.json({ status: "false", "error": err })
                        }
                        else {
                            console.log("1", req.body);
                            stripe.subscriptions.create(
                                {
                                    customer: customer_id,
                                    items: [{ price: price_id }],
                                    coupon: code
                                },
                                function (err, subscription) {
                                    if (err) {
                                        console.log("2", err);
                                        res.json({ status: "false", "error": err })
                                    } else {
                                        console.log(" to update SubId", subscription.status);
                                        if (subscription.status == 'active') {
                                            req.getConnection((err, conn) => {
                                                conn.query("UPDATE subscribedCounties SET subId = '" + subscription.id +
                                                    "', isSubscribed = 1 where userid ='" + req.body.userId
                                                    + "' and countypractice = '" + req.body.countyName + "';", (err, result) => {
                                                        if (err) {
                                                            console.log(err);
                                                            res.json({ status: "false", "error": err })
                                                        } else {
                                                            conn.query("SELECT * FROM subscribedCounties WHERE userid = '" + req.body.userId + "'AND isSubscribed = 1 ;", (err, countyName) => {
                                                                if (err) {
                                                                    console.log("2", err);
                                                                    res.json({ status: "false", "error": err })
                                                                } else {
                                                                    console.log("COunty Names");
                                                                    console.log("Updated subscription");
                                                                    res.json({ status: "true", "card": card, "countyName": countyName });
                                                                }
                                                            })

                                                        }
                                                    });
                                            })
                                        } else {
                                            res.json({ status: "false", "error": "Either you don't have sufficient balance or please try again" })
                                        }
                                    }
                                }
                            )
                        }
                    })
            }
        }
    )
})
// app.post('/stripe/subscription', stripController.subscription)
// app.post('/stripe/getCurrentSubscription/:userId', stripController.getCurrentSubscription)
/********************get all subscriptions****************************/

router.get('/getallsubscriptions', function (req, res) {
    console.log("Get all Subscription");
    stripe.subscriptions.list(
        { limit: 100 },
        function (err, subscriptions) {
            if (err) {
                res.send({ "status": false, "error": err })
            }
            else {
                res.json({ status: "true", "subscriptions": subscriptions })
            }
        }
    );

});

router.post('/getallcustomers', function (req, res) {
    console.log("Get all subscription")
    stripe.customers.list(
        { limit: 100 },
        function (err, customers) {
            if (err) {
                res.send({ "status": "false", "error": err })
            }
            else {
                res.send({ status: "true", "customers": customers })
            }
        }
    );

});

router.post('/retrivecoupon', function (req, res) {

    stripe.coupons.retrieve(
        req.body.coupon,
        function (err, coupons) {
            if (err) {
                res.send(err)
            }
            else {
                res.send(coupons);
            }
        }
    );
});

router.post('/stripe/cancelSubscription', stripController.cancelSubscription);

module.exports = router;