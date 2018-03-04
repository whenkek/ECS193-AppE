var process = require('process');
var express = require('express');
var Knex = require('knex');

var FetchRequestHandler = require('./FetchRequestHandler.js');
var InsertRequestHandler = require('./InsertRequestHandler.js');
var CheckTokenHandler = require('./CheckTokenHandler.js');

var app = express();
var multer = require('multer');
var upload = multer();

var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
app.use(jsonParser);

app.enable('trust proxy');

//UNCOMMENT BEFORE DEPLOY
//process.env.NODE_ENV = 'production';

var knex = Connect()

function Connect ()
{	
    var config = {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE
	};

     if (process.env.INSTANCE_CONNECTION_NAME && process.env.NODE_ENV === 'production') 
        config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
    
    if (process.env.NODE_ENV != 'production') {
        config.host = '35.199.174.8';
        config.user = 'huhu';
        config.password = 'password';
        config.database = 'ecs193_database';
    }

    var knex = Knex({
        client: 'mysql',
        connection: config
    }); 
	
    return knex;
}

app.get('/', function (req, res, next) {
    res.status(404)
        .set('Content-Type', 'text/plain')
        .send(' ')
        .end();
});

//FETCHES

app.post('/fetch/doctors', function (req, res, next) {
    if (!req.is('application/json'))
        return next();
    FetchRequestHandler.fetchDoctors(knex, req, res);
});

app.post('/fetch/idFromEmail', function (req, res, next) {
    if (!req.is('application/json'))
        return next();
    FetchRequestHandler.fetchIDfromEmail(knex, req, res);
});

app.post('/fetch/doctorList', function (req, res, next) {
    if (!req.is('application/json'))
        return next();
    FetchRequestHandler.fetchDoctorPatients(knex, req, res);
});

app.post('/fetch/readings', function (req, res, next) {
    if (!req.is('application/json'))
        return next();
    FetchRequestHandler.fetchReadings(knex, req, res);
});

app.post('/fetch/doctorReadings', function (req, res, next) {
    if (!req.is('application/json'))
        return next();
    FetchRequestHandler.fetchDoctorReadings(knex, req, res);
});

//INSERTS

app.post('/insert/doctor', jsonParser, function (req, res, next) {
	if(!req.is('application/json'))
		return next();
    InsertRequestHandler.insertDoctor(knex, req, res);
});

app.post('/insert/patient', jsonParser, function (req, res, next) {
	if(!req.is('application/json'))
		return next();
    InsertRequestHandler.insertPatient(knex, req, res);
});

app.post('/insert/reading', jsonParser, function (req, res, next) {
    if(!req.is('application/json'))
        return next();
    InsertRequestHandler.insertReading(knex, req, res);
});

app.post('/insert/reading', upload.fields([]), function (req, res, next) {
    if(!req.is('multipart/form-data'))
        return next();
    InsertRequestHandler.insertReading(knex, req, res);
});

app.post('/insert/reading', function (req, res, next) {
    res.status(404)
        .set('Content-Type', 'text/plain')
        .send('You took a wrong turn somewhere.')
        .end();
});

//CHECKS

app.post('/check/token', jsonParser, function (req, res, next) {
    if(!req.is('application/json'))
        return next();
    CheckTokenHandler.checkToken(knex, req, res);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, function ()
{
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

module.exports = app;