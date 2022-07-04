// Require all dependencies
const express = require('express');
const cors = require('cors');
const MongoUtil = require('./MongoUtil');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Initialise Express app
const app = express();

// MIDDLEWARES:
// Enable Cross Site Origin Resources Sharing (CORS)
app.use(cors());

// Enable JSON processing
app.use(express.json());

// Check if user if authenticated to perform action
const checkIfAuthenticated = function(req, res, next) {
  let authorizationHeaders = req.headers.authorization; // Note: This will return the string 'Bearer <accessToken>'

  // Check if there is an authorization header
  if (!authorizationHeaders) {
    res.sendStatus(401); // res.status() + res.send() combined
    return;
  }

  // Get token from authorization header
  let token = authorizationHeaders.split(' ')[1];

  // Verify token
  // -> after verification, the token data will be passed to the function in the third arg
  jwt.verify(token, process.env.TOKEN_SECRET, function(err, tokenData) {
    // If there is error (ie. err is not null or undefined)
    if (err) {
      res.sendStatus(401);
      return;
    }
    else {
      req.user = tokenData;
    }
  })

  // IMPORTANT: Call the next function
  next();
}


async function main() {
  // Connect to Mongo database
  const db = await MongoUtil.connect(process.env.MONGO_URI, 'tgc18_food_sightings_jwt');

  // ROUTES
  app.get('/', function(req, res) {
    res.send('hello world');
  })

  // Route to allow client to add new student
  // Note: POST method because we are creating a new student document
  app.post('/students', async function(req, res) {
    // Information required to add a new student:
    // username
    // age
    // email
    // password
    // classes (array of strings)
    let {username, age, email, password} = req.body;
    let classes = req.body.classes.split(',');

    // Check that all information has been provided
    if (username && age && email && password && classes) {
      await db.collection('students').insertOne({
        username,
        age,
        email,
        password,
        classes
      });

      res.status(201); // HTTP status (created)
      res.json({
        'message': 'New student created successfully'
      });
    }
    else {
      res.status(400); // HTTP status (bad request)
      res.json({
        'message': 'Invalid fields provided'
      });
    }
  });

  // Route to allow client to log in a student
  // Note: POST method because we are creating a new JWT token
  app.post('/login', async function(req, res) {
    // Get email and password from user
    let {email, password} = req.body;

    // Check that email and password are provided
    if (email && password) {
      // Find student document with the same email and password
      let student = await db.collection('students').findOne({
        email,
        password
      }); // -> null if student does not exist

      // If student exists in database
      if (student) {
        // Create a JWT token
        // First arg: object to store data (make sure no senstive data is stored in it)
        // Second arg: TOKEN SECRET
        // Third arg: options object
        let token = jwt.sign({
          'username': student.username,
          'age': student.age,
          'classes': student.classes
        },
        process.env.TOKEN_SECRET,
        {
          'expiresIn': '15m'
        });

        // Return access token
        res.json({
          'accessToken': token
        });

      }
      else {
        // No student found with the same email and password (invalid credentials)
        res.status(401); // HTTP status (unauthorized)
        // Note: Never tell the user which fields provided are invalid for security reasons
        res.json({
          'message': 'Invalid email or password'
        });
      }
    }
    else {
      // If email and/or password not provided
      console.log(email, password)
      res.status(400); // HTTP status (bad request)
      res.json({
        'message': 'Please provide email and password fields'
      });
    }
  });

  // Route to check student profile
  app.get('/profile', checkIfAuthenticated, function(req, res) {
    res.send(req.user);
  })

  // Route to allow student to update profile
  app.put('/students/:student_id/update', checkIfAuthenticated, async function(req, res) {
    // Get current student details
    let student = await db.collection('students').findOne({
      '_id': ObjectId(req.params.student_id)
    });

    let updatedStudent = {
      username: req.body.username || student.username,
      age: req.body.age || student.age,
      email: req.body.email || student.email,
      password: student.password,
      classes: req.body.classes.split(',') || student.classes
    };

    let result = await db.collection('students').updateOne({
      '_id': ObjectId(req.params.student_id)
    }, {
      '$set': {
        ...updatedStudent
      }
    });

    res.status(200); // HTTP status (OK)
    res.json(result);
  })

}

main();

// START SERVER
app.listen(3000, function() {
  console.log('Server has started.');
})