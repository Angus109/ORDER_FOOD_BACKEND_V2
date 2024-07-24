const mongoose = require("mongoose")

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

});

const Items = mongoose.model("Items", itemSchema)

const createItems = async function (body) {
    try {
        let item = new Items(body); 
        const response = await item.save()
        return {code: 200, result: {
            success: true,
            result: response
        }}
    } catch (error) {
        return {code: 500, result: {
            success: false,
            error: error
        }}
    }
}

module.exports.createItem = createItems 