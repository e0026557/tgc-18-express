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
app.use(express.urlencoded({
    'extended': false // use extended : true if you are processing objects in objects in a form
}))

const BASE_API_URL = 'https://ckx-movies-api.herokuapp.com/'; // Take note of the '/' at the end of the API endpoint!

// ROUTES
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
app.get('/create-movie', function(req, res) {
    res.render('create-movie-form.hbs');
})


app.post('/create-movie', async function(req, res) {
    let url = BASE_API_URL + 'movie/create';
    
    let data = {
        title: req.body.title,
        plot: req.body.plot
    }
    
    await axios.post(url, data);
    
    res.redirect('/');
})


// Update movie entry
app.get('/update-movie', function(req, res) {
    res.render('update-movie-form.hbs');
})

app.post('/update-movie', async function(req, res) {
    let movieId = req.body.id;
    let url = `${BASE_API_URL}movie/${movieId}`;
    let data = {
        title: req.body.title,
        plot: req.body.plot
    };

    await axios.patch(url, data);

    res.redirect('/');
})

// Delete movie entry
app.get('/delete-movie', function(req, res) {
    res.render('delete-movie-form.hbs');
})

app.post('/delete-movie', async function(req, res) {
    let movieId = req.body.id;
    let url = `${BASE_API_URL}movie/${movieId}`;
    
    await axios.delete(url);

    res.redirect('/');
})

// START SERVER
app.listen(3000, function() {
    console.log('Server started');
})