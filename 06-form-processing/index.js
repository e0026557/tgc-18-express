// Require in dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// 1. Set up express
const app = express();
app.set('view engine', 'hbs');
app.use(express.static('public')); // tell express to look for the static files in the public folder

// Set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Set up express to process forms
app.use(express.urlencoded({
    'extended': false // use extended : true if you are processing objects in objects in a form
}))

// 2. ROUTES
app.get('/', function (req, res) {
    res.send('hello world');
})

app.get('/add-food', (req, res) => {
    res.render('add.hbs');
})

app.post('/add-food', function (req, res) {
    // We are getting a post request -> req
    // the content of the form is in request.body
    let foodName = req.body.foodName;
    let calories = req.body.calories;
    let meal = req.body.meal;
    console.log(req.body);
    console.log(req.body.foodName); // the key of req.body is the name of the input field in the form
    console.log(req.body.calories); // the key of req.body is the name of the input field in the form

    console.log(req.body.meal);

    // CHECKBOXES:
    // -> If only ONE checkbox is selected, a single value is stored
    // -> If MORE THAN ONE checkboxes are selected, an array is stored
    // -> If no checkboxes is selected, nothing is returned at all
    // THEREFORE, NEED TO STANDARDISE TO ALL BE IN ARRAY

    // if 2 or more checkboxes, we just save it as array
    // if only 1 checkbox, turn it into array with a value
    // if no checkboxes is checked, turn it into an empty array

    // METHOD 1:
    let tags = req.body.tag;

    // tags will be undefined if the user never select any checkboxes
    if (!tags) {
        tags = [];
    }
    // tags is either an array or a string
    else if (!Array.isArray(tags)) {
        tags = [tags];
    }

    // METHOD 2 : shortcut using nested ternary
    // tags = Array.isArray(tags) ? tags : tags ? [tags] : [];

    // METHOD 3 : shortcut using logical shortcircuit and ternary 
    // tags = tags || []; // -> if tags is undefined, it will be assigned [] (take the last value if no truthy values)
    // tags = Array.isArray(tags) ? tags : [tags]; // -> if tags is not array, assign tag to be inside an array, else keep it as it is

    console.log(req.body.tag);
    res.render('result.hbs', {
        'foodName': foodName,
        'meal': meal,
        'calories': calories,
        'tags': tags
    });
})

// 3. START SERVER
app.listen(3000, function () {
    console.log('Server started');
})