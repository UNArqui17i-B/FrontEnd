'use strict';

var replace = require('replace-in-file');
var express = require('express');
var app = express();
var HOST_PORT = process.env.HOST_PORT || '5010';
var HOST_URL = process.env.HOST_URL || '127.0.0.1';
var BACK_PORT = process.env.BACK_PORT || '5000';
var BACK_URL = process.env.BACK_URL || 'localhost';

var options = {
    files: __dirname + '/build/unbundled/src/Blinkbox-app.html',
    from: /BACK_URL/g,
    to: BACK_URL + ':' + BACK_PORT,
};
try {
    var changedFiles = replace.sync(options);
    console.log('Modified files:', changedFiles.join(', '));
} catch (error) {
    console.error('Error occurred:', error);
}

app.use(express.static(__dirname + '/build/unbundled'));
app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(HOST_PORT, HOST_URL);