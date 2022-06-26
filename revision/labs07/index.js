// Require dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');


// Initialise Express app
const app = express();

// Set view engine
app.set('view engine', 'hbs'); // Set hbs as view engine

// Set up static folder
app.use(express.static('public'));

// Set up wax-on for template inheritance
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts'); // where to get templates from

// Enable form processing
app.use(express.urlencoded({
    extended: false
}));

// GLOBAL VARIABLES
const BASE_API_URL = 'https://ckx-restful-api.herokuapp.com/';

// ROUTES
// LAB 7A : READ
app.get('/', async function(req, res) {
    let response = await axios.get(BASE_API_URL + 'sightings');
    let sightings = response.data;

    res.render('index.hbs', {
        sightings
    });
});

// LAB 7B : CREATE
// -> route to display form to create new sightings
app.get('/create', function(req, res) {
    res.render('create-sightings.hbs');
});

// -> route to process form
app.post('/create', async function(req, res) {
    let sightings = {
        description: req.body.description,
        food: req.body.food.split(','), // to convert to an array
        datetime: req.body.datetime
    };

    // Submit new sightings to API endpoint using POST
    await axios.post(BASE_API_URL + 'sighting', sightings);

    // Redirect to homepage
    res.redirect('/');
});


// LAB 7C : UPDATE
// -> route to display form to update sightings
app.get('/:sighting_id/update', async function(req, res) {
    // Get current details of sightings
    let response = await axios.get(BASE_API_URL + 'sighting/' + req.params.sighting_id);
    let sightings = response.data;

    // Note that there is a 'Z' at the back of datetime 
    sightings.datetime = sightings.datetime.slice(0, -1);

    res.render('update-sightings.hbs', {
        sightings
    });
});

// -> route to process form
app.post('/:sighting_id/update', async function(req, res) {
    // Get updated details of sightings
    let sightings = {
        description: req.body.description,
        food: req.body.food.split(','),
        datetime: req.body.datetime
    };

    // Update food sightings
    await axios.put(BASE_API_URL + 'sighting/' + req.params.sighting_id, sightings);

    // Redirect to homepage
    res.redirect('/');
});

// LAB 7D : DELETE
// -> route to ask user to confirm deletion of a sighting
app.get('/:sighting_id/delete', async function(req, res) {
    // Get details of sighting to be deleted
    let response = await axios.get(BASE_API_URL + 'sighting/' + req.params.sighting_id);
    let sightings = response.data;

    res.render('delete-sightings.hbs', {
        sightings
    });
});

// -> route to process form
app.post('/:sighting_id/delete', async function(req, res) {
    // Delete food sighting
    await axios.delete(BASE_API_URL + 'sighting/' + req.params.sighting_id);

    // Redirect to homepage
    res.redirect('/');
});


// START SERVER
app.listen(3000, function() {
    console.log('Server has started.');
});