const mongoose = require('mongoose');

function connectToDatabase() {
    return mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('MongoDB connected');
        })
        .catch((err) => {
            console.log('Error connecting to MongoDB', err);
        });
}

module.exports = connectToDatabase;