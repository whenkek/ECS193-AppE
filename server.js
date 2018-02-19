var process = require('process');
var express = require('express');
var Knex = require('knex');

var FetchRequestHandler = require('./FetchRequestHandler.js');
var InsertRequestHandler = require('./InsertRequestHandler.js');

var app = express();
var multer = require('multer');
var upload = multer();


var bodyParser = require('body-parser')
//	app.use(bodyParser.json()); // support json encoded bodies
	//app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
	//app.use(bodyParser.raw({ extended: true })); // support encoded bodies
	//app.use(bodyParser.text({ extended: true })); // support encoded bodies

app.enable('trust proxy');

var knex = Connect()

function Connect ()
{
	
    var config = {
		/*
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE
		*/
		user: "huhu",
        password: "password",
        database: "ecs193_database"
    
	};

     if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') 
        config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    
    if (process.env.SQL_HOST && process.env.NODE_ENV != 'production')
        config.host = process.env.SQL_HOST;

    var knex = Knex({
        client: 'mysql',
        connection: config
    }); 
	
    return knex;
}

app.get('/', function (req, res, next)
{
    res.status(404)
        .set('Content-Type', 'text/plain')
        .send('Please use subdirectories \'/fetch\' or \'/insert\'')
        .end();
});

app.get('/fetch', function (req, res, next)
{
 	knex.select("*")
    .from('table-test')
    .orderBy('id')
    .limit(10)
    .then((results) => {
      return results.map((visit) => `id: ${visit.id}, 
	  ch1: ${visit.ch1}, 
	  ch2: ${visit.ch2}, 
	  ch3: ${visit.ch3}, 
	  ch4: ${visit.ch4}`);
    }).then((visits) => {
      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`Database entries :\n${visits.join('\n')}`)
        .end();
    })
    .catch((err) => {
      next(err);
    }); 
	//SELECT table_name FROM information_schema.tables;
    //FetchRequestHandler.testFetch(knex, res);
/* 	knex.select('timestamp', 'userIp')
    .from('visits')
    .orderBy('timestamp', 'desc')
    .limit(10)
    .then((results) => {
      return results.map((visit) => `Time: ${visit.timestamp}, AddrHash: ${visit.userIp}`);
    }).then((visits) => {
      res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send(`Last 10 visits:\n${visits.join('\n')}`)
        .end();
    })
    .catch((err) => {
      next(err);
    }); */
	//SELECT table_name FROM information_schema.tables;
    //FetchRequestHandler.testFetch(knex, res);
});

/**
*	Intended for single insertion.
*   Post format should be application/x-www-form-urlencoded:
*   Body format
*   i.e.
		testdb:{parentid: 2, float1: 1, float2:2,float4:2}
*/
app.post('/insert', express.urlencoded({ extended: true }),  function (req, res, next)
{
	if(!req.is('application/x-www-form-urlencoded'))
		return next()
	console.log('Content-Type \'application/x-www-form-urlencoded\'')
	
	knex('testtable')
    InsertRequestHandler.testInsert(knex, req, res);
}); 
/**
*	Intended for large volume insertion.
*   Post format should be multipart/form-data:
*   Data should be entered in JSON style. The first key should specify the table name
	i.e.
	testdb:{ "parentid": 2, "float1": 1, "float2":2,"float4":2 }
	testdb:{ "parentid": 3, "float1": 1, "float2":2,"float4":2 }
	testdb:{ "parentid": 4, "float1": 1, "float2":2,"float4":2 }
	testdb:{ "parentid": 5, "float1": 1, "float2":2,"float4":2 }
*/
app.post('/insert', upload.fields([]), function (req, res, next)
{
	if(!req.is('multipart/form-data'))	
		return next()
	
	console.log('Content-Type \'multipart/form-data\'')
	
	console.log(typeof(req.body))
    InsertRequestHandler.testInsert(knex, req, res);
});
app.post('/insert', function (req, res)
{
	res.status(400)
        .set('Content-Type', 'text/plain')
        .send('Bad Content-Type')
        .end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, function ()
{
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;