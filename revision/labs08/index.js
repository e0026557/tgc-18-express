// Require dependencies
const express = require('express');
const hbs = require('hbs');
const helpers = require('handlebars-helpers')({
    handlebars: hbs.handlebars
});
const wax = require('wax-on');
const MongoUtil = require('./MongoUtil.js');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

// Global variables
const MONGO_URI = process.env.MONGO_URI;

// Main function
async function main() {
    // Initialise Express app
    const app = express();

    // Set view engine
    app.set('view engine', 'hbs');

    // Set up static folder
    app.use(express.static('public'));

    // Set up wax-on for template inheritance
    wax.on(hbs.handlebars);
    wax.setLayoutPath('./views/layouts');

    // Enable form processing
    app.use(express.urlencoded({
        extended: false
    }));

    // Connect to Mongo
    const db = await MongoUtil.connect(MONGO_URI, 'cico');

    // ROUTES
    app.get('/', function(req, res) {
        res.send('hello world');
    });

    // LAB 8A
    // CREATE : Add new food record
    // -> route to display form to add new food record
    app.get('/food/add', function(req, res) {
        res.render('add-food.hbs');
    });

    // -> route to process form
    app.post('/food/add', async function(req, res) {
        // Get form details
        let {foodName, calories, tags} = req.body;

        // Format tags array
        tags = tags || [];
        if (!Array.isArray(tags)) {
            tags = [tags];
        }

        // Add food record to database
        db.collection('food').insertOne({
            foodName,
            calories,
            tags
        });
        

        // Redirect to homepage
        res.redirect('/food');
    });

    // LAB 8B
    // READ : Display all food records
    app.get('/food', async function(req, res) {
        // Get all food records
        let foodRecords = await db.collection('food').find({}).toArray();

        res.render('food.hbs', {
            foodRecords
        });
    });

    // LAB 8C
    // UPDATE : Edit food records
    // -> route to display form to edit food record
    app.get('/food/:food_id/edit', async function(req, res) {
        // Get existing food record
        let foodRecord = await db.collection('food').findOne({
            '_id': ObjectId(req.params.food_id)
        });

        res.render('edit-food.hbs', {
            foodRecord
        });
    });

    // -> route to process form
    app.post('/food/:food_id/edit', async function(req, res) {
        // Get updated food record
        let {foodName, calories, tags} = req.body;

        // Format tags
        tags = tags || [];
        if (!Array.isArray(tags)) {
            tags = [tags];
        }

        // Update food record in database
        await db.collection('food').updateOne({
            '_id': ObjectId(req.params.food_id)
        }, {
            '$set': {
                foodName: foodName,
                calories: calories,
                tags: tags
            }
        });

        // Redirect to homepage
        res.redirect('/food');
    });


    // HANDS ON A
    // DELETE : Delete a food record
    // -> route to display confirmation of deletion of food record
    app.get('/food/:food_id/delete', async function(req, res) {
        // Get food record to be deleted
        let foodRecord = await db.collection('food').findOne({
            '_id': ObjectId(req.params.food_id)
        });

        res.render('delete-food.hbs', {
            foodRecord
        });
    });

    //-> route to process form
    app.post('/food/:food_id/delete', async function(req, res) {
        // Delete food record
        await db.collection('food').deleteOne({
            '_id': ObjectId(req.params.food_id)
        });

        // Redirect to homepage
        res.redirect('/food');
    })


    // LAB EXERCISE 1
    // CREATE : Add animals
    // -> route to display form to add new animal
    app.get('/animal/add', function(req, res) {
        res.render('add-animal.hbs');
    });

    // -> route to process form
    app.post('/animal/add', async function(req, res) {
        // Get form details
        let {name, age, type, gender, notes} = req.body;

        await db.collection('animals').insertOne({
            name,
            age,
            type,
            gender, 
            notes
        });

        // Redirect to homepage
        res.redirect('/animal');
    });

    // READ : Display all animals
    app.get('/animal', async function(req, res) {
        // Get all animals
        let animalRecords = await db.collection('animals').find({}).toArray();

        res.render('animals.hbs', {
            animalRecords
        });
    });

    // LAB EXERCISE 2
    // UPDATE : Edit animal details
    // -> route to display form to edit animal details
    app.get('/animal/:animal_id/update', async function(req, res) {
        // Get existing animal details
        let animalRecord = await db.collection('animals').findOne({
            '_id': ObjectId(req.params.animal_id)
        });

        res.render('edit-animal.hbs', {
            animalRecord
        });
    });

    // -> route to process form
    app.post('/animal/:animal_id/update', async function(req, res) {
        // Get updated animal details
        let {name, age, type, gender, notes} = req.body;

        // Update animal details in database
        await db.collection('animals').updateOne({
            '_id': ObjectId(req.params.animal_id)
        }, {
            '$set': {
                name,
                age,
                type,
                gender,
                notes
            }
        });

        // Redirect to homepage
        res.redirect('/animal');
    });

    // START SERVER
    app.listen(3000, function() {
        console.log('Server has started.');
    });

}

main();