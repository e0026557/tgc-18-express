// Setup dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// Set up express
const app = express();
app.set('view engine', 'hbs');
app.use(express.static('public'));

// Set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Set up expresss to handle form processing
app.use(express.urlencoded({
    extended: false
}));


// ROUTES
app.get('/', function (req, res) {
    res.send('hello there');
})

// Hands on A
app.get('/calculate-bmi', function (req, res) {
    res.render('calculate-bmi.hbs');
})

app.post('/calculate-bmi', function (req, res) {
    let units = req.body.units || 'metric'; // to set a default value using logical OR shortcircuit if units is a falsy value 

    let weight = Number(req.body.weight);
    let height = Number(req.body.height);

    let bmi = weight / height ** 2;
    if (units == 'imperial') {
        bmi *= 703;
    }
    res.render('calculate-bmi.hbs', {
        bmi: bmi
    });
})

// Hands on B
app.get('/fruits', function (req, res) {
    res.render('fruits.hbs')
})

app.post('/fruits', function (req, res) {
    let priceList = {
        'durian': 15,
        'apple': 3,
        'orange': 6,
        'banana': 4
    };

    // Note that checkboxes may return undefined, a single value, or an array depending on the number of checkboxes checked by user
    let items = req.body.items || []; // set default value to [] if no checkboxes is checked by user
    // Put single value into array if only ONE checkbox is checked
    if (!Array.isArray(items)) {
        items = [items];
    }

    let totalCost = 0;
    for (let item of items) {
        totalCost += priceList[item];
    }

    res.render('fruits.hbs', {
        totalCost: totalCost
    })
})

// Hands-on C
app.get('/lost-and-found', (req, res) => {
    res.render('lost-and-found.hbs');
})

app.post('/lost-and-found', (req, res) => {
    // Setup flags
    let invalidItem = false;
    let invalidEmail = false;
    let invalidLocation = false;
    let invalidProperty = false;

    let item = req.body.item;
    let email = req.body.email;
    let location = req.body.location || []; // default value of [] if no radio buttons checked
    let properties = req.body.properties || []; // default value of [] if no checkboxes checked
    if (!Array.isArray(properties)) {
        properties = [properties]; // convert to array if property is a single value (if only 1 checkbox is checked)
    }

    // Item name must be more than 3 characters but less than 200 characters long
    if (item.length < 4 || item.length > 199) {
        invalidItem = true;
    }

    // Email address must have at least a '@' character and '.' character
    if (!email.includes('@') || !email.includes('.')) {
        invalidEmail = true;
    }

    // One location must be selected
    if (!location || Array.isArray(location)) {
        invalidLocation = true;
    }

    // Only 1 to 3 properties must be selected
    if (properties.length < 1 || properties.length > 3) {
        invalidProperty = true;
    }

    console.log('invalid item:', invalidItem);
    console.log('invalid email:', invalidEmail);
    console.log('invalid location:', invalidLocation);
    console.log('invalid property:', invalidProperty);

    if (invalidItem || invalidEmail || invalidLocation || invalidLocation) {
        res.render('lost-and-found.hbs');
    }
    else {
        res.render('success.hbs');
    }
})



// START SERVER
app.listen(3000, function () {
    console.log('Server started.');
});