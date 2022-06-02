// STEPS TO CREATING NODE APPLICATION
// 1. Create a working directory for the app
// 2. Cd to working directory
// 3. Type 'npm init' in terminal
//    'yarn add express'
// 4. Create index.js file
// const express = require('express')
// 5. Install node monitor
// type 'npm install -g nodemon' in terminal 
// 6. Install hbs template
// type 'yarn add hbs'


// We need to use Express for this, so we need to include in Node.js
// NodeJS will look for 'express' in the node_modules folder and locate the index.js there
// -> the index.js will return an object and will be stored into the const variable called 'express'
const express = require('express');

const hbs = require('hbs');

// Create an express application
let app = express();

// Tell express that we are using hbs as the template engine
app.set('view engine', 'hbs');

// Tell express where to find static files
// static files -> browser javascripts, images, css
app.use(express.static('public')) // 'public' because we put all the static files in 'public' folder

// Add routes
// a route is a URL on our server
// First arg -> path of the URL
// Second arg -> a function that happens when a client tries to access the path
app.get('/', function(request, response) {
    // First arg -> request from the client
    // Second arg -> the response which we are going to send back
    // response.send('Hello World');

    // HBS files will always be in 'views' folder so no need to indicate the relative path
    response.render('index.hbs');
})

app.get('/about-us', function(request, response) {
    response.send('About Us');
})


// This is better for Search Engine Optimization because it is clearer compared to query strings
// Note: Any words or sequence of characters that is in front of ':' is a parameter or argument
app.get('/hello/:name', function(req, res) {
    // res.send() can send back a string or an integer
    // but if it is an integer, it must be a HTTP status code (Eg. 200, 400, 500)
    res.send('Hi, ' + req.params.name);
})


app.get('/greet/:firstname/:lastname', function(req, res) {
    let firstname = req.params.firstname;
    let lastname = req.params.lastname;


    // No need to put 'hello.hbs' because express knows that we are using hbs as the template engine
    // The second arg -> allows use to pass variables to the hbs file
    // -> the key is the variable in the hbs file
    // -> the value is the value for the variable in the hbs file
    res.render('hello', {
        'firstname': firstname,
        'lastname': lastname
    })
})

// We expect the URL to have 2 parameters in the query string,
// which will be a and b
// Eg. /calculate?a=3&b=4
// NOTE: whitespaces are replaced with '%' in query strings since we cannot have whitespaces
app.get('/calculate', function(req, res) {
    // All query string parameters will be in the query object
    // NOTE: all in strings!
    let a = parseInt(req.query.a);
    let b = parseInt(req.query.b);
    res.send(`Sum = ${a+b}`)
})

// NOTE: The routes must be defined before we launch the server, otherwise any routes after the server is launched will be ignored
// Start the server
// First arg -> port number
// Second arg -> function that will run when the server is run
app.listen(3000, function() {
    console.log('server started');
})

// Node monitor
// type 'npm install -g nodemon' in terminal 
// NOTE: Need to install each time for each instance of gitpod