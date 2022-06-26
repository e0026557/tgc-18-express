// Require dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');

// Initialise Express app
const app = express();

// Set up view engine
app.set('view engine', 'hbs');

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
const BASE_API_URL = 'https://ckx-movies-api.herokuapp.com/';


// ROUTES
// READ : Display all movies
app.get('/', async function(req, res) {
    // Get all movies
    let response = await axios.get(BASE_API_URL + 'movies');
    let movies = response.data;

    res.render('index.hbs', {
        movies
    });
});

// CREATE : Create a new movie
// -> route to display form to create new movie
app.get('/create', function(req, res) {
    res.render('create-movie.hbs');
});

// -> route to process form
app.post('/create', async function(req, res) {
    // Get form details
    // -> title, plot
    await axios.post(BASE_API_URL + 'movie/create', req.body);

    // Redirect to homepage
    res.redirect('/');
});

// UPDATE : Edit existing movie
// -> route to display form to edit existing movie
app.get('/:movie_id/update', async function(req, res) {
    // Get existing movie details
    let response = await axios.get(BASE_API_URL + 'movie/' + req.params.movie_id);
    let movie = response.data;

    res.render('update-movie.hbs', {
        movie
    });
});

// -> route to process form
app.post('/:movie_id/update', async function(req, res) {
    // Get new movie details
    // -> title, plot
    await axios.patch(BASE_API_URL + 'movie/' + req.params.movie_id, req.body);

    // Redirect to homepage
    res.redirect('/');
});

// DELETE : Delete existing movie
// -> route to display confirmation for deletion of movie
app.get('/:movie_id/delete', async function(req, res) {
    // Get existing details of movie to be deleted
    let response = await axios.get(BASE_API_URL + 'movie/' + req.params.movie_id);
    let movie = response.data;

    res.render('delete-movie.hbs', {
        movie
    });
});

// -> route to process form
app.post('/:movie_id/delete', async function(req, res) {
    // Delete movie
    await axios.delete(BASE_API_URL + 'movie/' + req.params.movie_id);

    // Redirect to homepage
    res.redirect('/');
});

// START SERVER
app.listen(3000, function() {
    console.log('Server has started.');
});