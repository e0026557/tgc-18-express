// Require dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');


// Initialise Express app
const app = express();

// Set view engine
app.set('view engine', 'hbs'); // Set hbs as the view engine

// Set up static folder
app.use(express.static('public'));

// Set up wax on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts'); // where to get templates from

// Set up form processing (otherwise req.body will be undefined)
app.use(express.urlencoded({
    extended: false
}));


// ROUTES
app.get('/', function (req, res) {
    res.render('index.hbs');
});

app.get('/submit-fault', function (req, res) {
    res.render('submit-fault.hbs');
});

app.post('/submit-fault', function (req, res) {
    // Extract form details
    let { name, location, description } = req.body;
    res.send(`name is ${name}, location of fault = ${location}, description=${description}`);
});

app.get('/admin', function (req, res) {
    res.render('admin.hbs');
});


// START SERVER
app.listen(3000, function () {
    console.log('Server has started.');
});