const express = require('express');
const hbs = require('hbs');

const app = express();
app.set('view engine', 'hbs'); // set the view engine to hbs
app.use(express.static('public')); // the public folder will hold our static files

app.get('/', function(req, res) {
    res.send('Hello world');
}) 

app.listen(3000, function() {
    console.log('server started');
})