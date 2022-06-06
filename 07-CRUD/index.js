// HTTP Methods:
// GET -> 'read'
// POST -> 'create'
// -- The below are not supported for form processing --
// DESTROY -> 'delete'
// PUT -> 'update'
// PATCH -> 'update' (Note: Only used in rare instances)

// Set up dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios'); // for access to RESTful API

const app = express();
app.set('view engine', 'hbs');
app.use(express.static('public')); // tell express to look for the static files in the public folder

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Set up express to process forms
app.use(express.urlencoded({
    'extended': false // use extended : true if you are processing objects in objects in a form
}))


// ROUTES
const BASE_API_URL = 'https://ckx-restful-api.herokuapp.com'

app.get('/', async function(req, res) {
    let url = BASE_API_URL + '/sightings';
    let response = await axios.get(url);

    res.render('sightings.hbs', {
        'foodSightings': response.data
    })
})

// Show the create food sighting form
// Troubleshooting
// 1. Get a error post / ... 
// 2. res.send(req.body)

app.get('/food_sightings/create', function(req, res) {
    res.render('food-form.hbs');
})

app.post('/food_sightings/create', async function(req, res) {
    // Note: food must be an array according to the API documentation
    let data = {
        'description': req.body.description,
        'food': req.body.food.split(','), // convert to array by splitting the string by ','
        'datetime': req.body.datetime
    }
    
    // Axios.post
    // first arg -> api endpoint
    // second arg -> data to post
    await axios.post(BASE_API_URL + '/sighting', data);
    res.redirect('/'); // telling the browser to go to '/' route 
})


// START SERVER
app.listen(3000, function() {
    console.log('server started');
})