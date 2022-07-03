// Require dependencies
const express = require('express');
const hbs = require('hbs');
const helpers = require('handlebars-helpers')({
  'handlebars': hbs.handlebars
});
const wax = require('wax-on');
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

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

  // Connect to Mongo database
  const db = await MongoUtil.connect(process.env.MONGO_URI, 'tgc-18-lab-08');

  // ROUTES
  app.get('/', function (req, res) {
    res.send('hello world');
  })

  // CREATE: Add a fault
  // -> route to display form to report fault
  app.get('/faults/create', function(req, res) {
    res.render('add-fault.hbs');
  })

  // -> route to process form to report fault
  app.post('/faults/create', async function(req, res) {
    // Get fault details
    let {title, location, tags, block, name, email} = req.body;

    // Format tags to be an array
    tags = tags || []; // default value to be an empty array if no tags selected
    if (!Array.isArray(tags)) {
      tags = [tags]; // convert tags to an array if not an array already
    }

    // Additional fields for admin to fill in
    const followUp = false;
    const resolved = false;
    const comment = '';

    const newFault = {
      title, 
      location,
      tags,
      block,
      name,
      email,
      followUp,
      resolved,
      comment
    };

    // Insert fault to database
    await db.collection('faults').insertOne(newFault);

    // Redirect to homepage
    res.send('Thank you. Your report has been submitted successfully.');

  })


  // Route to show all faults
  app.get('/faults/admin', async function (req, res) {
    // Get all faults
    let faultRecords = await db.collection('faults').find({}).toArray();

    res.render('faults.hbs', {
      faultRecords
    });
  })

  // Route to update fault report
  // -> display form to update fault report
  app.get('/faults/:fault_id/update', async function(req, res) {
    // Get existing fault report
    let faultRecord = await db.collection('faults').findOne({
      _id: ObjectId(req.params.fault_id)
    });

    res.render('update-fault.hbs', {
      faultRecord
    });
  })

  // -> process form to update fault report
  app.post('/faults/:fault_id/update', async function(req, res) {
    // Get updated fault report
    let updatedFaultRecord = {...req.body};

    // Format tags into array
    updatedFaultRecord.tags = updatedFaultRecord.tags || []; // default value to be empty array if no tags selected
    if (!Array.isArray(updatedFaultRecord.tags)) {
      updatedFaultRecord.tags = [updatedFaultRecord.tags]; // convert to array if not already an array
    }

    // Update fault report in database
    await db.collection('faults').updateOne({
      _id: ObjectId(req.params.fault_id)
    }, {
      "$set": updatedFaultRecord
    });

    // Redirect to admin view
    res.redirect('/faults/admin');

  })

  // START SERVER
  app.listen(3000, function () {
    console.log('Server has started.');
  })

}

main();