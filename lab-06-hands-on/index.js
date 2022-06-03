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
app.get('/', function(req, res) {
    res.send('hello there');
}) 

app.get('/calculate-bmi', function(req, res) {
    res.render('calculate-bmi.hbs');
})

app.post('/calculate-bmi', function(req, res) {
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

// START SERVER
app.listen(3000, function() {
    console.log('Server started.');
});