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

// require in handlebars-helpers
const helpers = require('handlebars-helpers')({
    'handlebars': hbs.handlebars
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
    });

    // Route to display form for adding notes
    app.get('/food/:foodid/notes/add', async function(req, res) {
        // let foodRecord = await getFoodRecordById(req.params.foodid);
        let foodRecord = await db.collection('food_records').find({
            '_id': ObjectId(req.params.foodid)
        }, {
            // projection is to select a few fields from the document to display
            'projection': {
                'food': 1
            }
        });

        res.render('add-note.hbs', {
            'foodRecord': foodRecord
        })
    });

    // Route to process form
    app.post('/food/:foodid/notes/add', async function(req,res){
        await db.collection('food_records').updateOne({
            // which document to update
            '_id': ObjectId(req.params.foodid)
        }, {
            // what we want to do with the document
            '$push': {
                // notes array (if does not exist, mongodb will create a new array)
                'notes': {
                    '_id': ObjectId(), // if ObjectId has no argument then MongoDB will create a new unique ID
                    'content': req.body.content
                }
            }
        });

        res.redirect('/food/'+ req.params.foodid + '/notes');
    })

    app.get('/food/:foodid/notes', async function(req, res){
        let foodRecord = await getFoodRecordById(req.params.foodid);
        res.render('show-notes.hbs', {
            'foodRecord': foodRecord
        });
    })

    app.get('/food/:foodid/notes/:noteid/update', async function(req, res) {
        // findOne() will only work return main document, but not the sub-document alone
        // -> need to use projection to get the sub-document
        let foodRecord = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.foodid)
        }, {
            'projection': {
                'notes': {
                    // Only show the element in the array that matches the criteria
                    '$elemMatch': {
                        '_id': ObjectId(req.params.noteid)
                    }
                }
            }
        });

        let noteToEdit = foodRecord.notes[0];
        res.render('edit-note.hbs', {
            'content': noteToEdit.content
        });

    });


    app.post('/food/:foodid/notes/:noteid/update', async function(req, res) {
        // Get new note content
        let newContent = req.body.content;

        await db.collection('food_records').updateOne({
            '_id': ObjectId(req.params.foodid),
            'notes._id': ObjectId(req.params.noteid)
        }, {
            '$set': {
                // The $ sign will refer to the notes at the top
                'notes.$.content': newContent
            }
        });

        res.redirect(`/food/${req.params.foodid}/notes`);
    });


    app.get('/food/:foodid/notes/:noteid/delete', async function(req, res){
        let foodRecord = await db.collection('food_records').findOne({
            '_id': ObjectId(req.params.foodid),
            'notes._id': ObjectId(req.params.noteid)
        }, {
            'projection': {
                'notes.$': 1
            }
        });

        let noteToDelete = foodRecord.notes[0];
        res.render('delete-note.hbs', {
            'note': noteToDelete
        });
    })

    app.post('/food/:foodid/notes/:noteid/delete', async function(req, res) {
        await db.collection('food_records').updateOne({
            '_id': ObjectId(req.params.foodid)
        }, {
            '$pull': {
                'notes': {
                    '_id': ObjectId(req.params.noteid)
                }
            }
        })

        res.redirect(`/food/${req.params.foodid}/notes`);
    })
}

main();

app.listen(3000, function () {
    console.log('Server started')
})