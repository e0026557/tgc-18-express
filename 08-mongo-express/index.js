const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');
// require('mongodb') will return a Mongo object
// the Mongo Client contains many other objects (also known as properties)
// but we are only interested in the MongoClient
const MongoClient = require('mongodb').MongoClient;

// dotenv
// a dotenv files also to create variables
// when we run config on the dotenv, all variables defined in 
const dotenv = require('dotenv').config();

// process is a NodeJS object available to all NodeJS programs
// -> Do not name any variables as 'process'
// the process variable refers to the current NodeJS that is running
// .env is the environment -- it is where the operating system stores its variables
// console.log(process.env);

const app = express();
app.set('view engine', 'hbs'); // tell express we are using hbs as the view engine
wax.on(hbs.handlebars); // set up template inheritance
wax.setLayoutPath('./views/layouts');


// URI is mainly used for applications, URL is mainly used for websites
const MONGO_URI = process.env.MONGO_URI;

// Connect to the Mongo Database using the MongoClient
async function main() {
    // MongoClient.connect function takes in 2 arguments
    // 1. the connection string
    // 2. an options object
    const Client = await MongoClient.connect(MONGO_URI, {
        'useUnifiedTopology': true // there were different versions of Mongo, when this is true, we don't have to care about 
    });

    // Connect to database before we setup the route so that everything is ready when route is loaded
    const db = Client.db('sample_airbnb');



    app.get('/test', async function(req, res) {
        // Use .toArray() to convert the results to an array of JavaScript objects
        let data = await db.collection('listingsAndReviews').find({}).toArray();
        res.send(data);
    })
}

main();

app.listen(3000, function() {
    console.log('Server started')
})