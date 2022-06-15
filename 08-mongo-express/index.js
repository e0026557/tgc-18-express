const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// We need the ./ in front of our own custom modules
// because without it, NodeJS will assume that we are requiring from the node_modules folder
// ./ means current folder
// const {connect} = require('./MongoUtil'); // -> shortcut

const MongoUtil = require('./MongoUtil');

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
    // const db = await connect(MONGO_URI, 'sample_airbnb'); // -> with the shortcut method
    const db = await MongoUtil.connect(MONGO_URI, 'sample_airbnb');

    app.get('/test', async function (req, res) {
        // Use .toArray() to convert the results to an array of JavaScript objects
        let data = await db.collection('listingsAndReviews').find({}).toArray();
        res.send(data);
    })
}

main();

app.listen(3000, function () {
    console.log('Server started')
})