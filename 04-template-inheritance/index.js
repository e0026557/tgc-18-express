const express = require('express');
const { handlebars } = require('hbs');
const hbs = require('hbs');
const waxOn = require('wax-on'); // wax-on provides template inheritance 

const app = express();
app.set('view engine', 'hbs'); // set the view engine to hbs
app.use(express.static('public')); // the public folder will hold our static files

// Set up wax-on
waxOn.on(hbs.handlebars);
// Tell wax-on where to find the base layouts (layouts = template)
waxOn.setLayoutPath('./views/layouts');


// Register our custom helpers
// ifEquals
// First arg -> name of helper
// Second arg -> callback function
// -> The callback function has 3 arg
// -> arg1 and arg2 are the data from the hbs
// -> arg3 is the options
hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    if (arg1 == arg2) {
        options.fn(this); // ask handlebars to execute the line inside the ifEquals block in the hbs file ('this' refers to hbs)
    }
    else {
        options.inverse(this); // execute the line in the else block
    }
})

// ROUTES
app.get('/', function(req, res) {
    res.send('Hello world');
}) 

app.listen(3000, function() {
    console.log('server started');
})