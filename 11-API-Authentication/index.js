const express = require('express');
require('dotenv').config(); // for .env file (to load the variables of the .env file)
const MongoUtil = require('./MongoUtil.js'); // require in the MongoUtil.js -> it is in the same directory as our index.js
const MONGO_URI = process.env.MONGO_URI; // Node monitor will not restart with changes in .env file
const cors = require('cors');
const { ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken'); // require jwt

const app = express();

// Enable CROSS SITE ORIGIN RESOURCES SHARING
// -> otherwise websites with different domain names cannot consume the API
app.use(cors()); // this is a middleware

// console.log('mongo uri', MONGO_URI);

// RESTFUL API expects data sent to the endpoint to be in JSON format
// -> need to tell Express to configure all received data to be converted to JSON
app.use(express.json()); // this is a middleware

// a function that is to be a middleware must have 3 arguments
// req = request
// res = response
// next = a function that when called, will pass the request to the next middleware.
// -> if there is no next middleware, then the route function will be called
const dummyMiddleware = function(req, res, next) {
    req.date = new Date();
    // to call the next middleware or the route function (if no more middleware)
    next(); // IMPORTANT: ALL middleware must call next() or res.send() eventually
    console.log('dummy middleware');
}

// app.use(dummyMiddleware);

const checkIfAuthenticated = function(req, res, next) {
    let authorizationHeaders = req.headers.authorization;
        console.log('Authorization headers=', authorizationHeaders); // -> will return 'Bearer <accessToken>'

        // check if there is an authorization header
        if (!authorizationHeaders) {
            res.sendStatus(401); // res.status() + res.send() combined
            return;
        }

        // Get the token
        let token = authorizationHeaders.split(' ')[1]; // -> to extract only the access token and not the 'bearer' part

        // Ask jwt to verify the token
        // -> after verification, the token data will be passed to the function specified in the third argument
        jwt.verify(token, process.env.TOKEN_SECRET, function(err, tokenData) {
            // If there is error
            // -> err will be null or undefined if there are no errors
            if (err) {
                res.sendStatus(401); // res.status() + res.send() combined
                return;
            }
            else {
                req.user = tokenData;
            }
        })

        // IMPORTANT PART OF MIDDLEWARE -> CALL THE NEXT FUNCTION
        next();
}

async function main() {
    const db = await MongoUtil.connect(MONGO_URI, 'tgc18_food_sightings_jwt');
    console.log('Connected to database');

    // ROUTES
    app.get('/', function(req,res) {
        res.send('hello world');
    })

    // POST route cannot be tested in the browser since it will always be GET request
    // -> use an external program to test (Eg ARC, or POSTMAN)
    // To protect this route (deny unauthorized user), we have to provide a way for the access token to be provided 
    app.post('/food_sightings', checkIfAuthenticated, async function(req, res) {
        // TODO: validation 
        // -> need to make sure that req.body is at least an array etc
        let description = req.body.description;
        let food = req.body.food;
        // when new Date() is called without an argument, then it will be the SERVER's date and time
        // -> trick is to convert the datetime to the user's timezone on the client side and not in the server
        let datetime = req.body.datetime ? new Date(req.body.datetime) : new Date();

        let result = await db.collection('sightings').insertOne({
            description: description,
            food: food,
            datetime: datetime,
            owner: ObjectId(req.user.user_id)
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


    // USER SIGNUP
    // -> for user signup, we need the user email and user password
    // POST : for creating new document
    // -> if the endpoint is 'POST /users' ==> creating new users
    // we assume req.body contains password and email
    app.post('/users', async function(req, res) {
        let newUser = {
            'email': req.body.email,
            'password': req.body.password
        };

        await db.collection('users').insertOne(newUser);
        res.status(201); // -> created
        res.json({
            'message': 'New user created successfully!'
        });
    });

    
    // RESTFUL API -- the URL suggests dealing with a resource ('piece of data')
    // -> create a login record, but need not save to a database
    // when the user login, the client must pass us the password and email
    app.post('/login', async function(req, res) {
        // attempt to find a document with the same password and email given
        let user = await db.collection('users').findOne({
            'email': req.body.email,
            'password': req.body.password
        }); // -> returns null if user does not exists

        // only if user is not undefined or not null
        if (user) {
            // the token can store data but make sure not to store sensitive data in it
            // first arg = data to store
            // second arg = token secret
            // third arg = options
            let token = jwt.sign({
                'email': req.body.email,
                'user_id': user._id
            }, process.env.TOKEN_SECRET, {
                'expiresIn': '15m' // m for minutes, h for hours, d for days, w for weeks 
            });

            res.json({
                'accessToken': token
            });
        }
        else {
            res.status('401');
            // NOTE: Never tell the user which of the fields are invalid for security
            res.json({
                'message': 'Invalid user name or password'
            });
        }

    });

}

main();



// LAUNCH SERVER
app.listen(3000, function() {
    console.log('Server has started.');
})