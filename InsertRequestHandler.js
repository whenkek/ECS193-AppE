var process = require('process');
var express = require('express');
var Knex = require('knex');

function insertPatient (knex, req, res)
{
	var data = req.body;

	knex('doctors')
		.where('name', data.doctor)
		.catch((err) => { console.log(err); })
		.then(function(rows) {
			if (rows.length >= 1)
			{
				knex('patients')
					.insert(data)
					.catch((err) => { console.log(err); })
					.then(function() {
						knex('patients')
							.orderBy('id', 'desc')
							.limit(1)
							.then(function(rows) {
								var row = rows[0];
								var id = row.id;
								var tableName = 'patient_' + id;
								knex.schema.
									createTable(tableName, function(table) {
										table.dateTime('timestamp').defaultTo(knex.fn.now()).primary();
										for (var i = 0; i < 4; i++)
											table.float('ch' + i).notNullable();
									})
									.then(function() {
										res.status(200)
											.set('Content-Type', 'text/plain')
											.send('Received: ' + JSON.stringify(data))
											.end();
									});
							});
					})
			}
			else
			{
				res.status(200)
					.set('Content-Type', 'text/plain')
					.send('No doctor of name exists.')
					.end();
			}
		});
}

function insertDoctor (knex, req, res)
{
	var data = req.body;

	knex('doctors')
		.where('name', data.name)
		.catch((err) => { console.log(err); })
		.then(function(rows) {
			if (rows.length >= 1)
			{
				res.status(200)
					.set('Content-Type', 'text/plain')
					.send('Doctor of same name already exists.')
					.end();
			}
			else
			{
				knex('doctors')
					.insert(data)
					.catch((err) => { console.log(err); })
					.then(function() {
						res.status(200)
							.set('Content-Type', 'text/plain')
							.send('Received: ' + JSON.stringify(data))
							.end();
					});
			}
		});
}

function insertReading (knex, req, res)
{
	var body = req.body;
	var resmsg = '';
	var errmsg = '';
	console.log(body);
	var success = true;
	var msg = '';
	var table_name = '';
	
	console.log('body: ' + req.body);
	for (var key in body)
	{
		console.log('key: ' + key);
		table_name = key; 
		if(Array.isArray(body[key]))
			values = body[key].map(x => JSON.parse(x));
		else
			try 
			{
				values = JSON.parse(body[key]);
			}
			catch(e) 
			{
				values = body[key];
			}
			break;
	}

	temp = knex(table_name).insert(values);
	knex.schema.hasTable(table_name).then(function (exists) {
		if(exists)
		{
			knex
				.transaction(function (trx) {
					temp.then (function (result) {
						res.status(200)
							.set('Content-Type', 'text/plain')
							.send("All insertions were success.")
							.end();
					})
				})
				.catch(function (err) {
					errmsg += err;				
					res.status(400)
						.set('Content-Type', 'text/plain')
						.send("The following commands had errors: " + errmsg)
						.end();
				});
		}
		else
		{
			errmsg += "Table: " + table_name + " does not exist.\n";
			res.status(400)
				.set('Content-Type', 'text/plain')
				.send("The following commands had errors: " + errmsg)
				.end();
		}
	});
}

module.exports.insertPatient = insertPatient;
module.exports.insertDoctor = insertDoctor;
module.exports.insertReading = insertReading;