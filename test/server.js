'use strict';

var server;
var express = require('express');
var app = express();

app.use(express.static('./test/fixtures'));
app.use(express.static('./node_modules'));

module.exports = {
    start: function (port, callback) {
        server = app.listen(port, callback);
    },
    stop: function (callback) {
        if(server) {
            server.close(callback);
        }
        else {
        	callback();
        }
    }
};