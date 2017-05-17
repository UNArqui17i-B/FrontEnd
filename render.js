'use strict';

const HOST_PORT = process.env.HOST_PORT || '5010';
const HOST_URL = process.env.HOST_URL || '127.0.0.1';
const serverFactory = require('spa-server');

const server = serverFactory.create({
    path: __dirname + '/build',
    hostname: HOST_URL,
    port: HOST_PORT,
    fallback: '/index.html'
});

server.start();