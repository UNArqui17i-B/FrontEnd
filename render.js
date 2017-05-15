'use strict';

const replace = require('replace-in-file');
const express = require('express');
const app = express();
const HOST_PORT = process.env.HOST_PORT || '5010';
const HOST_URL = process.env.HOST_URL || '127.0.0.1';

app.use(express.static(__dirname + '/build'));
app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(HOST_PORT, HOST_URL);