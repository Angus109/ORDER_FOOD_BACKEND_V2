const mongoose = require('mongoose');


module.exports = async function () {
    const connectionString = process.env.MERN_DATABSE

    try {
        await mongoose.connect(connectionString);
        console.log("connection done")
    } catch (error) {
        console.log(error)
    }
}