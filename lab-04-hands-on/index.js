const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

let app = express();

app.set('view engine', 'hbs');
app.use(express.static('public'));

// Set up wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

// ROUTES
app.get('/', function(req, res) {
    res.render('index.hbs');
})

app.get('/report-fault', function(req, res) {
    res.render('report-fault.hbs');
})

app.get('/admin', function(req, res) {
    res.render('admin.hbs');
})


// SERVER
app.listen(3000, ()=> {
    console.log('Server started.');
})
