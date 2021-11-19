// const stripe = require('stripe')('sk_test_51HYfuZG5xGk5XWZSptLB8FqfABt59Ni4rEeNG6iMclN0CUuWKIH8gUibRrk4ilyVV6rrC7Q8kPZBQ8VsqB17UDXg00FADgIAiX')
const stripe = require('stripe')('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')
//live prod_IS3zAqjw5pTZAM
// test prod_IEnRkaHPSRMS8K
//main live product prod_IS3zlitQ5M3TZJ
const product_id = 'prod_IS3zlitQ5M3TZJ';
const ResponseFormat = require('./../core').ResponseFormat;
var asyncLoop = require('node-async-loop');

module.exports = {

    async createSubcriptionPlan(req, res) {
        stripe.plans.create(
            {
                id: req.body.plan,
                amount: req.body.amount * 100,
                currency: 'usd',
                interval: 'month',
                product: product_id,
                interval_count: req.body.interval
            },
            function (err, plan) {
                if (!err) {
                    res.send({ status: "success", plan: plan })
                } else {
                    console.log(err)
                }
            }
        );
    },
    async listOfPlans(req, res) {
        console.log("List of plan")
        stripe.plans.list(
            { limit: 10, product: product_id, active: true },
            function (err, plans) {
                if (!err) {
                    console.log(plans);
                    res.status(200).json(ResponseFormat.build(
                        plans,
                        "Subcription list",
                        200,
                        "success"
                    ))

                } else {
                    console.log(err)
                }
            }
        )

    },
    async cancelAllSubscription(req, res) {
        console.log(req.body.userId);
        var reqObj = req.body;
        var count = 0;
        var subscriptionCancelled = [];
        req.getConnection((err, conn) => {
            conn.query("select subId from subscribedCounties where userid='" + reqObj.userId + "';", (err, result) => {
                if (err) {
                    console.log(err);
                    res.json({
                        "err": err,
                        "msg": "something is wrong"
                    })
                } else {
                    result.forEach(element => {
                        console.log(element.subId);
                        var subId = result.subId;
                        stripe.subscriptions.del(
                            subId,
                            function (err, confirmation) {
                                if (!err) {
                                    subscriptionCancelled.push(subId);
                                    count++;
                                    if (count == result.length) {
                                        res.json({ 'status': true, "subscriptionCancelled": subscriptionCancelled, 'msg': "Subscription cancelled", 'data': confirmation });
                                    }
                                } else {
                                    count++;
                                    if (count == result.length) {
                                        res.json({ 'status': false, "subscriptionCancelled": [], 'msg': "Subscription not cancelled", data: [] });
                                    }
                                }
                            }
                        );
                    });
                }
            })
        })
    },
    async cancelSubscription(req, res) {
        console.log("req body", req.body);
        var subId = req.body.subId;

        console.log("SubId to cancel", subId);
        stripe.subscriptions.del(
            subId,
            function (err, confirmation) {
                if (!err) {
                    console.log(confirmation.status, "dsffffffffffffffffffffffff", confirmation);
                    if (confirmation.status == 'canceled') {
                        req.getConnection((err, conn) => {
                            conn.query("UPDATE subscribedCounties SET isSubscribed = 0 WHERE subId ='" + req.body.subId + "';", (err, result) => {
                                if (err) {
                                    console.log(err);
                                    res.json({
                                        "err": err,
                                        "msg": "something is wrong"
                                    })
                                } else {
                                    conn.query("SELECT * FROM subscribedCounties WHERE userid = '" + req.body.userId +
                                        "' and isSubscribed = 1;", (err, subscribedCounty) => {
                                            if (err) {
                                                console.log(err);
                                                res.json({
                                                    "err": err,
                                                    "msg": "something is wrong"
                                                })
                                            } else {
                                                console.log("sub cancelled of", confirmation);
                                                res.json({ 'status': true, 'msg': "Subscription cancelled", subscribedCounty: subscribedCounty });
                                            }
                                        })
                                }
                            })
                        })
                    } else {
                        res.json({ 'status': false, 'msg': "Subscription not cancelled", data: [] });
                    }
                } else {
                    res.json({ 'status': false, 'msg': "Subscription not cancelled", data: [] });
                }
            }
        );
    }
}