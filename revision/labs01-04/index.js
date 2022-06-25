// Require dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// Initialize express app
const app = express();

// Set up view engine
app.set('view engine', 'hbs');

// Set up static folder
app.use(express.static('public'));

// Set up wax-on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts'); // -> where to get the templates from

// ROUTES
app.get('/', (req, res) => {
    res.send('<h1>Hello from Express</h1>');
});

app.get('/lab3', function(req, res) {
    res.render('index.hbs'); // Express will look for the hbs file under the 'views' directory
});

// Parameterised route
app.get('/hello/:name', (req, res) => {
    // Extract name from route parameter
    let name = req.params.name;
    res.send(`Hello, ${name}`);
});

// START SERVER
app.listen(3000, ()=> {
    console.log('Server has started.');
});