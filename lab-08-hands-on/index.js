const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// Import connect function in MongoUtil.js
const MongoUtil = require('./MongoUtil');

// To be able to use ObjectId for queries
const ObjectId = require('mongodb').ObjectId;

// Setup dotenv to be able to access env variables using process built-in variable
require('dotenv').config();

// require in handlebars-helpers
const helpers = require('handlebars-helpers')({
    'handlebars': hbs.handlebars
});

// Assign constants (for magic strings / numbers)
const DATABASE = 'animal_shelter';
const PETS = 'pets';

// Create express app
const app = express();
app.set('view engine', 'hbs'); // Tell express that we are using hbs as the view engine
wax.on(hbs.handlebars); // Set up template inheritance
wax.setLayoutPath('./views/layouts') // Tell wax-on where to get templates from

// To be able to process forms
// -> otherwise req.body will be undefined
app.use(express.urlencoded({
    extended: false
}));

// Access our env variable from .env file
const MONGO_URI = process.env.MONGO_URI;
// console.log(MONGO_URI);

// Helper functions
function formatTag(tagName) {
    let tags = tagName || []; // Set default to empty array if no tag checkboxes selected

    // Convert single value to an array if only 1 checkbox is selected
    if (!Array.isArray(tags)) {
        tags = [tags];
    }
    return tags;
}

async function main() {
    // Connect to database
    const db = await MongoUtil.connect(MONGO_URI, DATABASE);

    // Set up routes

    // Route to display all pets
    app.get('/', async function (req, res) {
        // Get all pets as array
        let allPetRecords = await db.collection(PETS).find({}).toArray();

        res.render('all-pets.hbs', {
            'allPets': allPetRecords
        });
    });

    // Route to display form to add new pet to system
    app.get('/add-pet', function (req, res) {
        res.render('add-pet.hbs');
    });

    // Route to add new pet to system
    app.post('/add-pet', async function (req, res) {
        // Get inputs from form
        let name = req.body.name;
        let breed = req.body.breed;
        let description = req.body.description;
        let age = req.body.age;
        let problems = req.body.problems.split(',');

        let tags = formatTag(req.body.tags);
        let approved = req.body.approved;
        // let approved = req.body.approved == 'true'; // -> to store as boolean if not by default it will be string

        // If key names is the same as variable names, we can use this shorthand -> keyname : variablename
        let petDocument = {
            name,
            breed,
            description,
            age,
            problems,
            tags,
            approved
        };

        await db.collection('pets').insertOne(petDocument);
        res.redirect('/');

    });


    // Route to display form to update pet details
    app.get('/update-pet/:petId', async function (req, res) {
        let id = req.params.petId;
        // Get current pet details
        // -> no need for .toArray() if using findOne since only one object is returned
        let pet = await db.collection('pets').findOne({
            '_id': ObjectId(id)
        });
        console.log(pet);

        res.render('update-pet.hbs', {
            'pet': pet
        });
    });

    // Route to update pet details
    app.post('/update-pet/:petId', async function (req, res) {
        let id = req.params.petId;
        // Get new pet details
        let petDocument = {
            'name': req.body.name,
            'breed': req.body.breed,
            'description': req.body.description,
            'age': req.body.age,
            'problems': req.body.problems.split(','),
            'tags': formatTag(req.body.tags),
            'approved': req.body.approved
        };

        await db.collection('pets').updateOne({
            '_id': ObjectId(id)
        }, {
            '$set': petDocument
        });

        res.redirect('/');
    });


    // Route to display confirmation message for user to delete pet entry
    app.get('/delete-pet/:id', async function(req, res) {
        let id = req.params.id;

        // Get current pet details
        let pet = await db.collection('pets').findOne({
            '_id': ObjectId(id)
        });

        res.render('delete-pet.hbs', {
            'pet': pet
        });

    });
}

main();

// Set up server
app.listen(3000, function () {
    console.log('Server started');
})