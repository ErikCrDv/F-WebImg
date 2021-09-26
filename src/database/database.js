const mongoose = require("mongoose");
const { database } = require('./keys');

mongoose.connect(database.URI, (error, database) => {
    if(error){ throw error}
    else { console. log('Database is connected'); }
});