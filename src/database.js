const mongoose = require("mongoose");

//const URI = 'mongodb://localhost/mern-task';
const URI = process.env.MongoURI;

mongoose.connect(URI,{useNewUrlParser: true, useUnifiedTopology: true})
    .then(db => console.log('La db se conecto'))
    .catch(err => console.log(err))


module.exports = mongoose;