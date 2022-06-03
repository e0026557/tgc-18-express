const express = require('express');
const hbs = require('hbs');
const waxOn = require('wax-on'); // wax-on provides template inheritance 

const app = express();
app.set('view engine', 'hbs'); // set the view engine to hbs
app.use(express.static('public')); // the public folder will hold our static files

// Set up wax-on
waxOn.on(hbs.handlebars);
// Tell wax-on where to find the base layouts (layouts = template)
waxOn.setLayoutPath('./views/layouts');

app.get('/', function(req, res) {
    res.send('Hello world');
}) 

app.listen(3000, function() {
    console.log('server started');
})