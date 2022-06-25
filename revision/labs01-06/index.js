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

// Registering own helper
hbs.handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
})

// Enable form processing
app.use(express.urlencoded({
    extended: false
}));


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

// Lab 5
app.get('/fruits', function(req,res) {
    let favorite = 'apples';

    res.render('fruits.hbs', {
        'fruits': ['apples', 'bananas', 'oranges'],
        'favoriteFruit': favorite
    });
});


// Lab 6
app.get('/add-food', (req, res) => {
    res.render('add-food.hbs');
});

// -> route to handle form
app.post('/add-food', (req, res) => {
    // Extract form information
    let {foodName, calories, tags} = req.body;

    // Format tags into array
    // Reason for formatting into array:
    // -> if no input, tags will be undefined
    // -> if only one input, tags will be a single value
    // -> if multiple inputs, tags will be an array of values

    tags = tags ? tags : []; // -> if no inputs, change to empty array
    if (!Array.isArray(tags)) {
        tags = [tags]; // -> if not an array, change to an array
    }
    
    res.render('display-food-summary', {
        foodName,
        calories,
        tags: tags.join(', ')
    });
});

// START SERVER
app.listen(3000, ()=> {
    console.log('Server has started.');
});