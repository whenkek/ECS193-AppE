var process = require('process');
var express = require('express');
var Knex = require('knex');

function testFetch (knex, res)
{
    res.status(200)
        .set('Content-Type', 'text/plain')
        .send('testFetch')
        .end();
}

module.exports.testFetch = testFetch;