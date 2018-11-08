var express = require('express');
var app = express();
var cors = require('cors')();

app.use(cors); //Cross-Origin Resource Sharing 


app.get('/', function (req, res) {
    res.sendFile('C:/Users/rhks1/NodeScrape/plotly.html');
});


app.listen(3030, function () {
    console.log('Example app listening on port 3030!');
});
