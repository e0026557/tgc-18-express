// Set up dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// Initialise Express app
const app = express();

// Set view engine
app.set('view engine', 'hbs');

// Set up static folder
app.use(express.static('public'));

// Set up wax-on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Enable form processing
app.use(express.urlencoded({
    extended: false
}));


// ROUTES
app.get('/', function (req, res) {
    res.send('hello world');
});

// Hands on A
app.get('/calculate-bmi', function (req, res) {
    res.render('calculate-bmi.hbs');
});

app.post('/calculate-bmi', function (req, res) {
    let { weight, height, unit } = req.body;
    weight = Number(weight);
    height = Number(height);

    let bmiResult = weight / height ** 2;
    if (unit == 'imperial') {
        bmiResult = bmiResult * 703;
    }

    res.render('calculate-bmi.hbs', {
        bmiResult
    });
});

// Hands on B
// Lookup table for price list
const prices = {
    'apple': 3,
    'durian': 15,
    'orange': 6,
    'banana': 4
};

app.get('/fruits', function (req, res) {
    res.render('fruits.hbs');
});

app.post('/fruits', function (req, res) {
    // Extract checkbox values 
    let fruits = req.body.fruits || []; // -> if no fruits selected, fruits will be defaulted to an empty array

    if (!Array.isArray(fruits)) {
        fruits = [fruits]; // -> if only one fruit is selected, it will be a single value so convert to an array with an item
    }


    let totalCost = 0;
    for (let fruit of fruits) {
        totalCost += prices[fruit];
    }

    res.render('fruits.hbs', {
        totalCost
    });
});


// Hands on C
app.get('/lost-and-found', function (req, res) {
    res.render('lost-and-found.hbs');
});

app.post('/lost-and-found', function (req, res) {
    // Set up flags
    let itemError = false;
    let emailError = false;
    let locationError = false;
    let descriptionError = false;
    let txtOthersError = false;

    let { item, email, location, txtOthers, properties } = req.body;

    if (item.length <= 3 || item.length >= 200) {
        itemError = true;
    }

    if (!email.includes('@') || !email.includes('.')) {
        emailError = true;
    }

    if (!location) {
        locationError = true;
    }

    if (location == 'others' && txtOthers) {
        locationError = false;
        location = txtOthers;
    }
    else if (location == 'others' && !txtOthers) {
        locationError = true;
        txtOthersError = true;
    }

    properties = properties || [];
    if (!Array.isArray(properties)) {
        properties = [properties];
    }

    if (properties.length < 1 || properties.length > 3) {
        descriptionError = true;
    }

    if (itemError || emailError || locationError || txtOthersError || descriptionError) {
        res.send('Error');
    }
    else {
        res.send('Submitted successfully');
    }

});

// START SERVER
app.listen(3000, function () {
    console.log('Server has started.');
});