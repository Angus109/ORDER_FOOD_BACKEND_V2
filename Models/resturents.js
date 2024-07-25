const mongoose = require("mongoose")

const resturentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    categories: {
        type: [new mongoose.Schema({
            rating: { type: Number },
            category: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Categories"
            }]
        })],
        minLength: 1,
    },
    image: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    location: {
        type: new mongoose.Schema({
            address: String,
            zoneId:
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Locations"
            },
            lat: Number,
            lon: Number
        })
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    description: {
        type: String,
        required: true
    }

});

const Resturent = mongoose.model("Resturent", resturentSchema)


const getallrestaurants = async function (res) {
    try{
        const response = await Resturent.find({})
    return {
        code: 200, result: {
            success: true,
            result: response
        }
    }
    }catch(error){
        return {
            code:500,
            result:{
                success: false,
                error: error
            }
        }
    }
}

const getresturents = async function (search) {

   try{
    const response = await Resturent.find().populate({
        path: 'categories',
        populate: {
            path: 'category'
        }
    }).populate({
        path: 'location',
        populate: {
            path: 'city'
        }
    })
    return {
        code: 200, result: {
            success: true,
            result: response
        }
    }

   }catch(error){
    return {
        code:500,
        result:{
            success:false,
            error: error
        }
    }
   }

}

const createresturents = async function (req, cloudinaryResponseForRestaurants) {
    try {
        const resturent = new Resturent({
            name: req.body.name,
            categories: {
                rating: "",
                category: req.body.categoryId
            },
            image: {
                public_id: cloudinaryResponseForRestaurants.public_id,
                url: cloudinaryResponseForRestaurants.secure_url
            },
            location: {
                address: req.body.address || "",
                zoneId: req.body.zoneId || "",
                lat: req.body.lat || "",
                lon: req.body.lon || ""
            },
            description: req.body.description
        });
        const response = await resturent.save()
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



module.exports.createresturent = createresturents
module.exports.getresturents = getresturents
module.exports.getallrestaurants = getallrestaurants
