const express = require('express');
const hbs = require('hbs');
const wax = require('wax-on');

// Import connect function in MongoUtil.js
const MongoUtil = require('./MongoUtil');

// Setup dotenv to be able to access env variables using process built-in variable
require('dotenv').config();

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

async function main() {
    // Connect to database
    const db = await MongoUtil.connect(MONGO_URI, DATABASE);

    // Set up routes

    // Route to display all pets
    app.get('/', async function(req, res) {
        // Get all pets as array
        let allPetRecords = await db.collection(PETS).find({}).toArray();

        res.render('all-pets.hbs', {
            'allPets': allPetRecords
        });
    });

    // Route to display form to add new pet to system
    app.get('/add-pet', function(req, res) {
        res.render('add-pet.hbs');
    });

    // Route to add new pet to system
    app.post('/add-pet', async function(req, res) {
        // Get inputs from form
        let name = req.body.name;
        let breed = req.body.breed;
        let description = req.body.description;
        let age = req.body.age;
        let problems = req.body.problems.split(',');

        let tags = req.body.tags || []; // Set default to empty array if no tag checkboxes selected

        // Convert single value to an array if only 1 checkbox is selected
        if (!Array.isArray(tags)) {
            tags = [tags];
        }

        // If key names is the same as variable names, we can use this shorthand
        let petDocument = {
            name,
            breed,
            description,
            age,
            problems,
            tags
        };

        await db.collection('pets').insertOne(petDocument);
        res.redirect('/');

    });


    // Route to display form to update pet details
    app.get('/update-pet/:petId', async function(req, res) {
        let id = req.params.petId;
        // Get current pet details
        let pet = await db.collection('pets').find({
            '_id': ObjectId(id)
        }).toArray();

        res.render('update-pet.hbs', {
            'pet': pet
        });
    });

}

main();

// Set up server
app.listen(3000, function() {
    console.log('Server started');
})