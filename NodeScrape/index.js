//var express = require('express');
//var app = express();
//var router = express.Router();
//var template = require('../lib/template.js');
//var server = require('http').createServer(app);
//var io = require('socket.io')(server);
var cheerio = require('cheerio');
var request = require('request');
var io = require('socket.io').listen(3000, function (req, res) {
    console.log('Listening on port 3000');
});

var dht22data = [];
var dateStr = '';
var CelsiusData = '';
var FahrenheitData = '';
var HumidityData = '';


//var url = 'http://192.168.0.133/';
var url = 'http://192.168.0.11/';

var Celsius = '';
function getCelsius() {

    request(url, function (err, res, body) {

        var $ = cheerio.load(body);

        $('#data .Celsius').each(function () {
            Celsius = $(this).text().substring(26, 31);
            //console.log(Celsius);
        });
    });
    return Celsius;
}

var Fahrenheit = '';
function getFahrenheit() {

    request(url, function (err, res, body) {

        var $ = cheerio.load(body);

        $('#data .Fahrenheit').each(function () {
            Fahrenheit = $(this).text().substring(29, 34);
            //console.log(Fahrenheit);
        });
    });
    return Fahrenheit;
}

var Humidity = '';
function getHumidity() {

    request(url, function (err, res, body) {

        var $ = cheerio.load(body);

        $('#data .Humidity').each(function () {
            Humidity = $(this).text().substring(12, 17);
            //console.log(Humidity);

        });
    });
    return Humidity;
}

// helper function to get a nicely formatted date string
function getDateString() {
    var time = new Date().getTime();
    // 32400000 is (GMT+9 Korea, GimHae)
    // for your timezone just multiply +/-GMT by 3600000
    var datestr = new Date(time + 32400000).toISOString().replace(/T/, ' ').replace(/Z/, '');
    return datestr;
}

// Check client connection & status
io.sockets.on('connection', function (socket) {
    // If socket.io receives message from the client browser then 
    // this call back will be executed.
    socket.on('message', function (msg) {
        //io.sockets.emit('message', dht22data);
        console.log(msg);
    });
    // If a web browser disconnects from Socket.IO then this callback is called.
    socket.on('disconnect', function () {
        //console.log('disconnected');
    });
});

setInterval(function () {
    // this array stores date and data of temp, humi.
    dateStr = getDateString();
    CelsiusData = getCelsius();
    FahrenheitData = getFahrenheit();
    HumidityData = getHumidity();
    dht22data[0] = dateStr; // Date
    dht22data[1] = CelsiusData; // temperature data
    dht22data[2] = FahrenheitData; // Fahrenheit data
    dht22data[3] = HumidityData; // humidity data
    io.sockets.emit('message', dht22data);
    console.log("COMSI," + dht22data);
}, 1500);

/*router.get('/', function (request, res) {
    var html = template.HTML(getCelsius(), getFahrenheit(), getHumidity());

    res.send(html);
});*/

/*router.get('/', function (req, res) {
    res.sendFile('C:/Users/rhks1/NodeScrape/plotly.html');
});*/

/*server.listen(3000, function (req, res) {
    console.log('Socket IO server listening on port 3000');
});*/

//module.exports = router;
