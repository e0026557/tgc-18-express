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

app.get('/food_sighting/edit/:food_sighting_id', async function(req, res) {
    // 1. We need to know which piece of data to edit
    // -> need a unique identifier
    let foodSightingId = req.params.food_sighting_id;

    // 2. Extract out the current values of each fields so that we can populate the form
    let response = await axios.get(BASE_API_URL + '/sighting/' + foodSightingId);
    let foodSighting = response.data;
    console.log(foodSighting.datetime); // -> note that there is a 'Z' at the back

    res.render('edit_food_form.hbs', {
        description: foodSighting.description,
        food: foodSighting.food,
        datetime: foodSighting.datetime.slice(0, -1) // remove the last 'Z'
    });
})

app.post('/food_sighting/edit/:food_sighting_id', async function(req, res) {
    let description = req.body.description;
    let food = req.body.food.split(','); // to get array
    let datetime = req.body.datetime;

    let sightingId = req.params.food_sighting_id;

    // 3. Create the payload
    let payload = {
        description: description,
        food: food,
        datetime: datetime
    }

    // 4. Send the request
    await axios.put(BASE_API_URL + '/sighting/' + sightingId, payload);

    res.redirect('/');
})



// START SERVER
app.listen(3000, function() {
    console.log('server started');
})