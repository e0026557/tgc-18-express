// require('mongodb') will return a Mongo object
// the Mongo Client contains many other objects (also known as properties)
// but we are only interested in the MongoClient
const MongoClient = require('mongodb').MongoClient;

async function connect(mongoUri, dbName) {
    // MongoClient.connect function takes in 2 arguments
    // 1. the connection string
    // 2. an options object
    const Client = await MongoClient.connect(mongoUri, {
        'useUnifiedTopology': true // there were different versions of Mongo, when this is true, we don't have to care about 
    });

    // Connect to database before we setup the route so that everything is ready when route is loaded
    const db = Client.db(dbName);
    return db;
}

// Export out connect function so that other JavaScript files can use
// module.exports = {
//     'connect': connect
// }
// -> we can do this if the key and value are the same
module.exports = {
    connect
}