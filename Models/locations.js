const mongoose = require("mongoose")

const locationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    province: {
        type: String,
        required: true,
    },
    zone : {
        type: String,
        required: true
    }
});

const Locations = mongoose.model("Locations", locationSchema)

const getLocation = async function () {
    const result = await Locations.find({})
    return result
}

const createlocations = async function (body) {


    try {
        let location = new Locations(body); 
        const response = await location.save()
        return {code: 200, result: response}
    } catch (error) {
        return {code: 400, result: error}
    }
}

module.exports.getLocation = getLocation 
module.exports.createlocation = createlocations 
module.exports.Locations = Locations