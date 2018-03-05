var process = require('process');
var express = require('express');
var Knex = require('knex');
var mailjet = require('node-mailjet');
var https = require('https');

<<<<<<< HEAD:TokenHandler.js
var CLIENT_IDS = [];
if (process.env.NODE_ENV != 'production')
{
    process.env.CLIENT_ID = '671445578517-ogrl80hb1pnq5ruirarvjsmvd8th2hjp.apps.googleusercontent.com';
    process.env.CLIENT_ELEC_ID = '671445578517-io87npos82nmk6bk24ttgikc9h4uls4l.apps.googleusercontent.com';
}
CLIENT_IDS = [process.env.CLIENT_ID, process.env.CLIENT_ELEC_ID, process.env.CLIENT_EMAILER];

function checkUserExists (knex, req, res) 
{
    console.log('Checking Token...');

    var body = req.body;

=======
function checkToken (knex, req, res) {
    // console.log('Checking Token...');

    var body = req.body;

    var CLIENT_IDS = [];
    if (process.env.NODE_ENV != 'production') // client id and token for development mode 
    {
        process.env.CLIENT_ID = '671445578517-ogrl80hb1pnq5ruirarvjsmvd8th2hjp.apps.googleusercontent.com';
        process.env.CLIENT_ELEC_ID = '671445578517-ju2jvd1beiofp9qqddn3cn6ai1dehmru.apps.googleusercontent.com';
    }
    CLIENT_IDS = [process.env.CLIENT_ID, process.env.CLIENT_ELEC_ID];

>>>>>>> 9e420159cd60782919a8e350de2de834039c3387:CheckTokenHandler.js
    token = body['idToken'];

    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client(process.env.CLIENT_ID);

<<<<<<< HEAD:TokenHandler.js
    async function verify() {
        try 
        {
=======
    async function verify() {  // decalartion of anonymous function
        try {
>>>>>>> 9e420159cd60782919a8e350de2de834039c3387:CheckTokenHandler.js
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_IDS  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
<<<<<<< HEAD:TokenHandler.js
            const payload = ticket.getPayload();
            //console.log(ticket);
            //console.log(payload);
            const userid = payload['sub'];
=======
            const payload = ticket.getPayload(); //retrieves oauth2 verification
            // console.log(ticket);
            // console.log(payload);
            const userid = payload['sub']; 
>>>>>>> 9e420159cd60782919a8e350de2de834039c3387:CheckTokenHandler.js
            const email = payload['email'];

            if (email == null || userid == null) 
            {
                res.status(400)
                    .set('Content-Type', 'text/plain')
                    .send("Email not found in payload!")
                    .end();
                return;
            }

            knex //checks if email exists in database and then matches the id
                .select()
                .from('faculty')
                .where('email', email)
                .then(function (results) {
                    var rows = results.map((row) => { return row; });
                    if (rows.length == 1) // token belongs to a doctor or administator
                    {
                        //console.log("Authorized");

                        var resObj = {
                            accType: rows[0].accType,
                            email: email,
                            name: rows[0].name
                        };

                        res.status(200)
                            .set('Content-Type', 'text/plain')
                            .send(JSON.stringify(resObj))
                            .end();
                    }
                    else if (rows.length == 0) // no match within faculty table, lets check if the token belongs to a patient
                    {
                        knex
                            .select()
                            .from('patients')
                            .where('email', email)
                            .then(function (resultsPat) {
                                var ids = resultsPat.map((row) => { return row.id; });
                                if (ids.length == 1) // this token belongs to a patient
                                {
                                    //console.log("Authorized");

                                    var resObj = {
                                        accType: 'patient',
                                        email: email,
                                        id: ids[0]
                                    };

                                    res.status(200)
                                        .set('Content-Type', 'text/plain')
                                        .send(JSON.stringify(resObj))
                                        .end();
                                }
                                else 
                                {
                                    //console.log("Unauthorized");
                                    // errmsg += "Table: " + table_name + " does not exist.\n";
                                    res.status(403)
                                        .set('Content-Type', 'text/plain')
                                        .send("Unauthorized")
                                        .end();
                                }
                            });
                    }
                    else // this should never happen... (we dont allow two rows with the same email.)
                    {
                        //console.log("Unauthorized");
                        // errmsg += "Table: " + table_name + " does not exist.\n";
                        res.status(403)
                            .set('Content-Type', 'text/plain')
                            .send("Unauthorized")
                            .end();
                    }
                });
        }
        catch(e) 
        {
            console.log('Auth: FAILURE');

            res.status(403)
                .set('Content-Type', 'text/plain')
                .send("BAD AUTH")
                .end();
        }
          // If request specified a G Suite domain:
          //const domain = payload['hd'];
    }
    verify(); //call the function we just made
}

function sendEmail (req, res)
{
    var body = req.body;

    if (process.env.NODE_ENV != 'production')
    {
        process.env.MAILJET_PUBLIC = '524c051f4fb254ae5636592655d92194';
        process.env.MAILJET_PRIVATE = '0b74bf7ddd333cad1d75c2dd2570cd7a';
    }

    var options = body['mailOptions'];
    var accessToken = body['accessToken'];

    var mailData = {
        'Messages': [{
            'From': {
                'Email': 'nicholas.michael.ng@gmail.com',
                'Name': 'Nicholas Ng'
            },
            'To': options.recipients,
            'Subject': options.subject,
            'TextPart': options.text,
            'HtmlPart': options.html
        }]   
    };

    var mailer = mailjet.connect(process.env.MAILJET_PUBLIC, process.env.MAILJET_PRIVATE);

    var httpsOptions = {
        hostname: 'www.googleapis.com',
        port: 443,
        path: '/oauth2/v1/tokeninfo?access_token=' + accessToken,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    };

    var httpsReq = https.request(httpsOptions, tokenCB);
    httpsReq.on('error', function(err) {
        console.log('problem with request: ' + err.message);
    });
    httpsReq.end();
    
    function tokenCB (cbRes)
    {
        cbRes.setEncoding('utf8');
        cbRes.on('data', function (cbBody) {
            if (JSON.parse(cbBody).hasOwnProperty('error'))
            {
                res.status(400)
                    .set('Content-Type', 'text/plain')
                    .send("Invalid Credentials")
                    .end();
                return;
            }

            var request = mailer.post('send', { 'version': 'v3.1' }).request(mailData);

            request
                .then(function (result) {
                    console.log(result.body);
                    res.status(200)
                        .set('Content-Type', 'text/plain')
                        .send("EMAIL SENT")
                        .end();
                })
                .catch(function (err) {
                    console.log(err);
                    res.status(400)
                        .set('Content-Type', 'text/plain')
                        .send("ERROR ON SEND")
                        .end();
                });
        });
    }
}

module.exports.checkUserExists = checkUserExists;
module.exports.sendEmail = sendEmail;