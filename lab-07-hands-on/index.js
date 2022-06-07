// Set up dependencies
const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
const axios = require('axios');

// Create express application
const app = express();
app.set('view engine', 'hbs');
app.use(express.static('public'));
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// Set up express to process forms
// -> Note: If this is not done, req.body will be undefined
app.use(express.urlencoded({
    'extended': false // use extended : true if you are processing objects in objects in a form
}))

const BASE_API_URL = 'https://ckx-movies-api.herokuapp.com/'; // Take note of the '/' at the end of the API endpoint!

// ROUTES
// NOTE: Typing in URL in the browser will always be a GET request
// -> The URL in the first argument of app.get() or app.post() is for the browser/client to interact with our express app
// -> axios.get etc in the function is used to communicate with the API (so we have to follow the API documentation)

// Index route - show all movies
app.get('/', async function(req, res) {
    // let url = BASE_API_URL + 'movies';
    // console.log(url); // -> to debug 404 errors (chances are incorrect URL)
    let response = await axios.get(BASE_API_URL + 'movies');
    let movies = response.data;

    res.render('all-movies.hbs', {
        'movies':movies
    });
})

// Create new movie entry
// Note: convention is to use /<noun>/<verb>
// Eg: /movies/create
app.get('/create-movie', function(req, res) {
    res.render('create-movie-form.hbs');
})


app.post('/create-movie', async function(req, res) {
    let url = BASE_API_URL + 'movie/create';
    
    // 'body' or 'payload' in API documentation refers to the data object that we are going to post to the API endpoint

    // Note: the keys in the 'data' object must match that required from the API
    let data = {
        title: req.body.title,
        plot: req.body.plot
    };
    
    await axios.post(url, data);

    // Alternatively:
    // await axios.post(url, {
    //     title: req.body.title,
    //     plot: req.body.plot
    // });
    
    res.redirect('/');
})


// Update movie entry
app.get('/update-movie/:movie_id', async function(req, res) {
    let movieId = req.params.movie_id;

    // Get movie entry
    let response = await axios.get(BASE_API_URL + 'movie/' + movieId);
    let movie = response.data

    res.render('update-movie-form.hbs', {
        movie: movie
    });
})

app.post('/update-movie/:movie_id', async function(req, res) {
    let movieId = req.params.movie_id;
    let url = BASE_API_URL + 'movie/' + movieId;
    let data = {
        title: req.body.title,
        plot: req.body.plot
    };

    await axios.patch(url, data);

    res.redirect('/');
})

// Delete movie entry
app.get('/delete-movie/:movie_id', async function(req, res) {
    let movieId = req.params.movie_id;

    let response = await axios.get(BASE_API_URL + 'movie/' + movieId);
    let movie = response.data;

    res.render('delete-movie-form.hbs', {
        movie: movie
    });
})

app.post('/delete-movie/:movie_id', async function(req, res) {
    let movieId = req.params.movie_id;
    let url = BASE_API_URL + 'movie/' + movieId;
    
    await axios.delete(url);

    res.redirect('/');
})

// START SERVER
app.listen(3000, function() {
    console.log('Server started');
})