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
    zone: {
        type: String,
        required: true
    }
});

const Locations = mongoose.model("Locations", locationSchema)

const getLocation = async function () {
    try {
        const result = await Locations.find({})
        return {
            code: 200, result: {
                success: true,
                result: result
            }
        }
    } catch (error) {
        return {
            code: 500,
            result: {
                success: false,
                error: error
            }
        }
    }
}

const createlocations = async function (body) {


    try {
        let location = new Locations(body);
        const response = await location.save()
        return {
            code: 200, result: {
                success: true,
                result: response
            }
        }
    } catch (error) {
        return {
            code: 500, result: {
                success: false,
                error: error
            }
        }
    }
}

module.exports.getLocation = getLocation
module.exports.createlocation = createlocations
module.exports.Locations = Locations