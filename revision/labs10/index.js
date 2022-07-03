// Require dependencies
const express = require('express');
const cors = require('cors');
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

// Initialise Express app
const app = express();

// Enable processing of JSON data
app.use(express.json());

// Enable CORS
app.use(cors());

// Main Function
async function main() {
  // Connect to Mongo database
  const db = await MongoUtil.connect(process.env.MONGO_URI, 'food_sightings');


  // Add in POST method to allow people to add food sightings
  app.post('/free_food_sighting', async function(req, res) {
    // Note:
    // The document posted must have 
    // -> description: a brief description of what the food sighting is
    // -> food: an array of short phrases about what the food is
    // -> datetime: when is the food sighting found (in yyyy-mm-dd format)

    let description = req.body.description;
    let food = req.body.food;
    let datetime = new Date(req.body.datetime) || new Date();

    try {
      // Insert document 
      let result = await db.collection('free_food_sighting').insertOne({
        description,
        food,
        datetime
      });

      res.status(201); // Set HTTP status code (created)
      res.send(result); // send result
    }
    catch(e) {
      res.status(500);
      res.send({
        error: 'Internal server error. Please contact administrator.'
      });
      console.log(e);
    }
  });

  // GET endpoint to allow people to search for food sightings
  app.get('/free_food_sighting', async function(req, res) {
    let criteria = {};
    
    if (req.query.description) {
      criteria['description'] = {
        $regex: req.query.description, 
        $options: 'i'
      }
    };

    if (req.query.food) {
      criteria['food'] = {
        '$in': [req.query.food]
      };
    }

    let result = await db.collection('free_food_sighting').find(criteria).toArray(); // Note that .toArray() is asynchronous function

    res.status(200);
    res.send(result);

  })

  // PUT endpoint to allow people to update food sighting
  // -> 'put' assumes that client updates all the fields in the document
  app.put('/free_food_sighting/:id', async function(req, res) {
    let description = req.body.description;
    let food = req.body.food;
    let datetime = new Date(req.body.datetime) || new Date();

    let result = await db.collection('free_food_sighting').updateOne({
      _id: ObjectId(req.params.id)
    }, {
      '$set': {
        description,
        food,
        datetime
      }
    });

    res.send(result);

  })


  // DELETE endpoint to allow people to delete food sighting
  app.delete('/free_food_sighting/:id', async function(req, res) {
    let result = await db.collection('free_food_sighting').deleteOne({
      _id: ObjectId(req.params.id)
    });

    res.status(200);
    res.send({
      message: 'OK'
    })
  })


}

main();

// START SERVER
app.listen(3000, function() {
  console.log('Server has started.');
})