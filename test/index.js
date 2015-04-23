var express = require('express')
var app = express()
var scratCombo = require('../index')

app.get('/co', scratCombo({
    name: 'demo',
    version: '1.0.0',
    dir: 'test/public',
    dest: 'c'
}))

var port = process.env.PORT || 1010;
app.listen(port);
console.log("Test server listen on %s", port);