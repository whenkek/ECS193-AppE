var process = require('process');
var express = require('express');
var Knex = require('knex');

function testInsert (knex, req, res)
{
	body = req.body;
	resmsg = "";
	errmsg = "";
	console.log(body)
	success = true
	for( var key in  body ) //foreachtable
	{
		table_name = key; 
		// format table_name:{Object1, Object2}; Object1 and Object2 are the string representation of json objects and must be parsed
		if(Array.isArray(body[key])){
			values = body[key].map( x => JSON.parse(x));
			msg = "INSERT INTO " +table_name +` VALUES ${body[key].join(", ")}`; //purely debug
		}
		else{
			values = JSON.parse(body[key])
			msg = "INSERT INTO " +table_name +` VALUES ${body[key]}`; //purely debug
		}
		console.log(values)
		resmsg += msg;
		knex.schema.hasTable(table_name).then( (exists) =>{
			if(exists)
			{
				knex.transaction((trx) => {
					knex(table_name).insert(values).then ( (result) => {
						console.log("hi");
						//res.json({ success: true, message: 'ok' });} )
					})
				.then(function(inserts) 
				{
					console.log(inserts.length + ' new books saved.');
				})
				})
				.catch((err) => {
					errmsg += err + msg + '\n';
					success = false
				});
			}
		});
	}
	console.log(errmsg)
	if(success)
		res.status(200)
			.set('Content-Type', 'text/plain')
			.send(resmsg)
			.end();
	else
		res.status(400)
		.set('Content-Type', 'text/plain')
		.send("The following commands had errors: " + errmsg)
		.end();
}

module.exports.testInsert = testInsert;