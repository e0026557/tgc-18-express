const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// We need the ./ in front of our own custom modules
// because without it, NodeJS will assume that we are requiring from the node_modules folder
// ./ means current folder
// const {connect} = require('./MongoUtil'); // -> shortcut

const MongoUtil = require('./MongoUtil');

const ObjectId = require('mongodb').ObjectId;

// dotenv
// a dotenv files also to create variables
// when we run config on the dotenv, all variables defined in 
const dotenv = require('dotenv').config();

// require in handlesbars-helpers
const helpers = require('handlebars-helpers')({
    'handlesbars': hbs.handlebars
})

// process is a NodeJS object available to all NodeJS programs
// -> Do not name any variables as 'process'
// the process variable refers to the current NodeJS that is running
// .env is the environment -- it is where the operating system stores its variables
// console.log(process.env);

const app = express();
app.set('view engine', 'hbs'); // tell express we are using hbs as the view engine
wax.on(hbs.handlebars); // set up template inheritance
wax.setLayoutPath('./views/layouts');

// To be able to process submited forms (content of forms will be in req.body and not be undefined)
app.use(express.urlencoded({
    extended: false
}));

// URI is mainly used for applications, URL is mainly used for websites
const MONGO_URI = process.env.MONGO_URI;

function getCheckboxValues(rawTags) {
    let tags = [];
    if (Array.isArray(rawTags)) {
        tags = rawTags;
    }
    else if (rawTags) {
        tags = [rawTags];
    }
    return tags;
}


// Connect to the Mongo Database using the MongoClient
async function main() {
    // const db = await connect(MONGO_URI, 'sample_airbnb'); // -> with the shortcut method
    const db = await MongoUtil.connect(MONGO_URI, 'tgc18-cico');
    
    async function getFoodRecordById(id) {
        // Be sure to provide id as ObjectId when searching for document by its ID
        let foodRecord = await db.collection('food_records').findOne({
            '_id': ObjectId(id)
        })
    
        return foodRecord;
    }

    app.get('/test', async function (req, res) {
        // Use .toArray() to convert the results to an array of JavaScript objects
        let data = await db.collection('listingsAndReviews').find({}).toArray();
        res.send(data);
    })

    app.get('/', async function (req, res) {
        const allFoodRecords = await db.collection('food_records')
            .find({})
            .toArray();

        res.render('all-food.hbs', {
            'allFood': allFoodRecords
        })
    })

    // Route to display form
    app.get('/add-food', function (req, res) {
        res.render('add-food.hbs');
    })

    // Route to process the form
    app.post('/add-food', async function (req, res) {
        console.log(req.body) // -> will be undefined if did not app.use(urlencoded)

        let foodRecordName = req.body.foodName;
        let calories = req.body.calories;
        let tags = [];
        if (Array.isArray(req.body.tags)) {
            tags = tags
        }
        else if (req.body.tags) {
            tags = [req.body.tags];
        }

        let foodDocument = {
            food: foodRecordName,
            calories: calories,
            tags: tags
        };

        await db.collection('food_records').insertOne(foodDocument);
        res.redirect('/');
    })

    app.get('/update-food/:id', async function (req, res) {
        let id = req.params.id;
        // Be sure to provide id as ObjectId when searching for document by its ID
        let foodRecord = await db.collection('food_records').findOne({
            '_id': ObjectId(id)
        })
        res.render('update-food.hbs', {
            'foodRecord': foodRecord
        });
    })

    app.post('/update-food/:id', async function (req, res) {
        let id = req.params.id;
        // The new key value pair we are going to use to update the document
        let updatedFoodRecord = {
            'food': req.body.foodRecordName,
            'calories': req.body.calories,
            'tags': getCheckboxValues(req.body.tags)
        }

        // update the food document
        // -> take note to use the $set to provide the new updated document
        await db.collection('food_records').updateOne({
            '_id': ObjectId(id)
        }, {
            '$set': updatedFoodRecord
        });

        res.redirect('/');
    });


    // route to delete
    app.get('/delete-food/:id', async function (req, res) {
        let id = req.params.id;

        // find document we are going to delete
        let foodRecord = await getFoodRecordById(id);

        res.render('confirm-delete-food', {
            'foodRecord': foodRecord
        })
    });

    app.post('/delete-food/:id', async function(req, res) {
        let id = req.params.id;
        await db.collection('food_records').deleteOne({
            '_id': ObjectId(id)
        });
        res.redirect('/');
    })
}

main();

app.listen(3000, function () {
    console.log('Server started')
})