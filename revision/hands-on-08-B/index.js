// Require dependencies
const express = require('express');
const hbs = require('hbs');
const helpers = require('handlebars-helpers')({
	handlebars: hbs.handlebars
});
const wax = require('wax-on');
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

// GLOBAL VARIABLES
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
	wax.setLayoutPath('./views/layouts'); // where to get templates from

	// Set up form processing
	app.use(express.urlencoded({
		extended: false
	}));

	// Connect to Mongo
	const db = await MongoUtil.connect(MONGO_URI, 'animal_shelter');


	// ROUTES
	app.get('/', function (req, res) {
		res.send('hello world hey');
	})

	// READ : Display all pets
	app.get('/pets', async function (req, res) {
		// Get all pets
		const petRecords = await db.collection('pets').find({}).toArray();

		res.render('pets.hbs', {
			petRecords
		});
	})

  // CREATE : Add pet to database
  // -> route to display form to add new pet
  app.get('/pets/add', function(req, res) {
    res.render('add-pet.hbs');
  })

  // -> route to process form to add new pet
  app.post('/pets/add', async function(req, res) {
    // Get pet details
    let {name, breed, description, age, problems, tags, hdbApproved} = req.body;

    // Convert problems into array of strings
    problems = problems.split(',');

    // Format value of tags
    tags = tags || []; // default value of empty array if no tags selected
    if (!Array.isArray(tags)) {
      tags = [tags]; // Convert tags to array if not already an array
    }

    // Add pet to database
    await db.collection('pets').insertOne({
      name,
      breed,
      description,
      age,
      problems,
      tags,
      hdbApproved
    });

    // Redirect to homepage
    res.redirect('/pets');
  })


  // READ : Diplay details of a pet given its ID
  app.get('/pets/:pet_id', async function(req, res) {
    // Get pet detail
    const petRecord = await db.collection('pets').findOne({
      _id: ObjectId(req.params.pet_id)
    })

    res.render('show-pet.hbs', {
      petRecord
    });
  })

  // UPDATE: Update details of a pet given its ID
  // -> route to display form to edit pet details
  app.get('/pets/:pet_id/update', async function(req, res) {
    // Get existing details of pet
    const petRecord = await db.collection('pets').findOne({
      _id: ObjectId(req.params.pet_id)
    });

    res.render('edit-pet.hbs', {
      petRecord
    })
  })
  
  // -> route to process form to edit pet details
  app.post('/pets/:pet_id/update', async function(req, res) {
    // Get updated pet details
    let {name, breed, description, age, problems, tags, hdbApproved} = req.body;

    // Convert problems to array
    problems = problems.split(',');

    // Format tags to be an array
    tags = tags || []; // default value to be empty array if no tags selected
    if (!Array.isArray(tags)) {
      tags = [tags]; // Convert tags to an array if not already an array
    }

    // Update entry in database
    await db.collection('pets').updateOne({
      _id: ObjectId(req.params.pet_id)
    }, {
      "$set": {
        name,
        breed, 
        description,
        age,
        problems,
        tags,
        hdbApproved
      }
    });

    // Redirect to homepage
    res.redirect('/pets');
  })

	// START SERVER
	app.listen(3000, function () {
		console.log('Server has started.');
	})
}

main();