var process = require('process');
var express = require('express');
var Knex = require('knex');



function checkToken (knex, req, res) {
    console.log('Checking Token...');
    var CLIENT_ID = process.env.CLIENT_ID;
    if (process.env.NODE_ENV != 'production')
        CLIENT_ID = '671445578517-ogrl80hb1pnq5ruirarvjsmvd8th2hjp.apps.googleusercontent.com';


    var body = req.body;

    token = body['idToken'];

    const {OAuth2Client} = require('google-auth-library');
    const client = new OAuth2Client(CLIENT_ID);

    async function verify() {
        try {
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
                // Or, if multiple clients access the backend:
                //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
            });
            const payload = ticket.getPayload();
            console.log(ticket);
            const userid = payload['sub'];
            const email = payload['email'];
            knex
                .select()
                .from('patients')
                .where('email', email)
                .then(function (results) {
                    var ids = results.map((row) => { return row.id; });
                    if (ids.length == 1)
                    {
                        console.log("Authroized");
                        res.status(200)
                            .set('Content-Type', 'text/plain')
                            .send(ids[0].toString())
                            .end();
                    }
                    else
                    {
                        console.log("Unauthorized");
                        // errmsg += "Table: " + table_name + " does not exist.\n";
                        res.status(403)
                            .set('Content-Type', 'text/plain')
                            .send("Unauthorized")
                            .end();
                    }
                });

            // knex.schema.hasTable(userid).then(function (exists) {
            //     if(exists)
            //     {
            //         console.log("Authroized");
            //         res.status(200)
            //             .set('Content-Type', 'text/plain')
            //             .send("GOOD")
            //             .end();
            //     }
            //     else
            //     {
            //         console.log("Unauthorized");
            //         // errmsg += "Table: " + table_name + " does not exist.\n";
            //         res.status(403)
            //             .set('Content-Type', 'text/plain')
            //             .send("Unauthorized")
            //             .end();
            //     }
            // });
            // knex.schema.hasTable(userid)

            // console.log(userid);
            // console.log('Auth: SUCCESS');
            

        }
        catch(e) {
            console.log('Auth: FAILURE');

            res.status(403)
                .set('Content-Type', 'text/plain')
                .send("BAD AUTH")
                .end();
        }
          // If request specified a G Suite domain:
          //const domain = payload['hd'];
    }

    // verify().catch(console.error);
    verify();

    
}

module.exports.checkToken = checkToken;