// Get dependency for database conenction
const MongoClient = require('mongodb').MongoClient;

// Connect function to connect to MongoDB database
async function connect(mongoUri, dbName) {
    // MongoClient.connect function takes in 2 arguments
    // arg 1: connection string
    // arg 2: options object
    const Client = await MongoClient.connect(mongoUri, {
        'useUnifiedTopology': true
    });

    // Connect to database
    const db = Client.db(dbName);
    return db;
}


// Export connect function for use in other JavaScript files
module.exports = {
    connect
};