var process = require('process');
var express = require('express');
var Knex = require('knex');

function fetchDoctors (knex, req, res)
{
    knex
        .select()
        .from('doctors')
        .then(function (results) {
            var names = results.map((row) => { return row.name; });
            res.status(200)
                .set('Content-Type', 'text/plain')
                .send(JSON.stringify(names))
                .end();
        });
}

function fetchIDfromEmail (knex, req, res)
{
    var data = req.body;

    knex
        .select()
        .from('patients')
        .where('email', data.email)
        .then(function (results) {
            var ids = results.map((row) => { return row.id; });
            if (ids.length == 1)
            {
                res.status(200)
                    .set('Content-Type', 'text/plain')
                    .send(ids[0].toString())
                    .end();
            }
        });
}

function fetchDoctorPatients (knex, req, res)
{
    var data = req.body;

    knex
        .select()
        .from('patients')
        .where('doctor', data.doctor)
        .then(function (results) {
            var ids = results.map((row) => { return row.id; });
            res.status(200)
                .set('Content-Type', 'text/plain')
                .send(JSON.stringify(ids))
                .end();
        });
}

function fetchReadings (knex, req, res, ids)
{
    var data = req.body;

    knex
        .select()
        .from('patient_' + data.id)
        .then(function (results) {
            var csv = '';
            var cnt = 0;
            Array.prototype.forEach.call(results, function (row)
            {
                var rowParse = '';
                for (var key in row)
                {
                    if (key == 'timestamp')
                        rowParse += row[key];
                    else
                        rowParse += ',' + row[key];
                }
                cnt++;
                if (cnt != results.length)
                    rowParse += '\n';
                csv += rowParse;
            });
            res.status(200)
                .set('Content-Type', 'text/plain')
                .send(csv)
                .end();
        });
}

function fetchDoctorReadings (knex, req, res, ids)
{
    var data = req.body;

    knex
    .select()
    .from('patients')
    .where('doctor', data.doctor)
    .then(function (results) {
        var pats = 0;
        var csv = '';
        Array.prototype.forEach.call(results, function (row)
        {
            var id = row['id'];
            knex
                .select()
                .from('patient_' + id)
                .then(function (patResults) {
                    var cnt = 0;
                    Array.prototype.forEach.call(patResults, function (patRow)
                    {
                        var rowParse = id.toString();
                        for (var key in patRow)
                            rowParse += ',' + patRow[key];
                        cnt++;
                        if (cnt != patResults.length)
                            rowParse += '\n';
                        csv += rowParse;
                    });
                    pats++;
                    if (pats == results.length)
                    {
                        res.status(200)
                            .set('Content-Type', 'text/plain')
                            .send(csv)
                            .end();
                    }
                    else
                        csv += '\n';
                });
        });
    });
}

function fetchReadingsSize (knex, req, res, ids)
{
    var data = req.body;

    knex
        .select()
        .from('patient_' + data.id)
        .then(function (results) {
            var csv = '';
            var cnt = 0;
            Array.prototype.forEach.call(results, function (row)
            {
                var rowParse = '';
                for (var key in row)
                {
                    if (key == 'timestamp')
                        rowParse += row[key];
                    else
                        rowParse += ',' + row[key];
                }
                cnt++;
                if (cnt != results.length)
                    rowParse += '\n';
                csv += rowParse;
            });
            res.status(200)
                .set('Content-Type', 'text/plain')
                .send(csv.length.toString())
                .end();
        });
}

module.exports.fetchDoctors = fetchDoctors;
module.exports.fetchIDfromEmail = fetchIDfromEmail;
module.exports.fetchDoctorPatients = fetchDoctorPatients;
module.exports.fetchReadings = fetchReadings;
module.exports.fetchDoctorReadings = fetchDoctorReadings;
module.exports.fetchReadingsSize = fetchReadingsSize;