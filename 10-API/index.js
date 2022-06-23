const express = require('express');
require('dotenv').config(); // for .env file (to load the variables of the .env file)
const MongoUtil = require('./MongoUtil.js'); // require in the MongoUtil.js -> it is in the same directory as our index.js
const MONGO_URI = process.env.MONGO_URI; // Node monitor will not restart with changes in .env file
const cors = require('cors');
const { ObjectId } = require('mongodb');

const app = express();

// Enable CROSS SITE ORIGIN RESOURCES SHARING
// -> otherwise websites with different domain names cannot consume the API
app.use(cors());

// console.log('mongo uri', MONGO_URI);

// RESTFUL API expects data sent to the endpoint to be in JSON format
// -> need to tell Express to configure all received data to be converted to JSON
app.use(express.json());

async function main() {
    const db = await MongoUtil.connect(MONGO_URI, 'tgc18_food_sightings');
    console.log('Connected to database');

    // ROUTES
    app.get('/', function(req,res) {
        res.send('hello world');
    })

    // POST route cannot be tested in the browser since it will always be GET request
    // -> use an external program to test (Eg ARC, or POSTMAN)
    app.post('/food_sightings', async function(req, res) {
        // TODO: validation 
        // -> need to make sure that req.body is at least an array etc
        let description = req.body.description;
        let food = req.body.food;
        // when new Date() is called without an argument, then it will be the SERVER's date and time
        // -> trick is to convert the datetime to the user's timezone on the client side and not in the server
        let datetime = req.body.datetime ? new Date(req.body.datetime) : new Date();

        let result = await db.collection('sightings').insertOne({
            description,
            food,
            datetime
        });

        res.status(201); // set HTTP status code (created)
        res.send(result);
    });


    app.get('/food_sightings', async function(req, res) {
        // Base query: the query that will get ALL the documents
        let criteria =  {};

        // Through query string (?description=free&food=chicken) for example
        // -> ? signifies the start of query string
        // -> each key value pair is separated by &
        if (req.query.description) {
            // Add description key into the criteria object
            // -> find 'chicken' in description for example
            // -> options 'i' means case insensitive
            criteria['description'] = {
                '$regex': req.query.description, '$options': 'i'
            };
        }

        if (req.query.food) {
            criteria['food'] = {
                '$in': [req.query.food]
            }
        }

        // let results = await db.collection('sightings').find(criteria).toArray(); // toArray() is asynchronous
        let results = await db.collection('sightings').find(criteria); 
        res.status(200);
        res.send(await results.toArray());  // -> because toArray() is an asynchronous function
        // res.send(results);

    })


    // UPDATE
    // PATCH VS PUT (most of the time use put -> assume that user wants to change all the values rather than a single field)
    // -> use PATCH if only change single field (rare case)
    app.put('/food_sightings/:id', async function(req, res) {
        let description = req.body.description;
        let food = req.body.food;
        let datetime =  req.body.date ? new Date(req.body.date) : new Date();
        let results = await db.collection('sightings').updateOne({
            '_id': ObjectId(req.params.id)
        }, {
            '$set': {
                'description': description,
                'food': food,
                'datetime': datetime
            }
        });

        res.status(200);
        res.json(results);
    });

    // DELETE
    app.delete('/food_sightings/:id', async function(req, res) {
        await db.collection('sightings').deleteOne({
            '_id': ObjectId(req.params.id)
        });

        res.status(200);
        res.json({
            'status': 'Ok'
        });
    });


}

main();



// LAUNCH SERVER
app.listen(3000, function() {
    console.log('Server has started.');
})