const mongoose = require("mongoose")

const resturentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }],
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
    delivaryTime:{
        minTime:{
            type:Number,
        },
        maxTime:{
            type: Number
        }
    },
    location: {
        address: String,
        zoneId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Location" // Assuming a Location model exists
        },
        lat: Number,
        lon: Number
    },
    description: {
        type: String,
        required: true
    },
    wallet: {
        balance: {
            type: Number,
            default: 0
        },
        creditAmounts: [{
            type: Number,
            required: true  // Adjust based on your requirements
        }],
        debitAmounts: [{
            type: Number,
            required: true  // Adjust based on your requirements
        }],
        transactionHistory: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction'
        }]
    },
    announcement: {
        count: {
            type: Number,
            default: 0
        },
        messages: [{
            type: String
        }]
    },
    openingHours: [{
        dayOfWeek: Number, // 0 for Sunday, 1 for Monday, etc.
        openTime: String, // e.g., "10:00"
        closeTime: String // e.g., "22:00"
    }],
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review" // Assuming a Review model exists
    }],
    averageRating: {
        type: Number,
        default: 0
    }
},{
    timestamps:true
}
);


const transactionSchema = new mongoose.Schema({
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: true
    },
    type: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});


const Resturent = mongoose.model("Resturent", resturentSchema)
const Transaction = mongoose.model('Transaction', transactionSchema);




resturentSchema.pre('save', async function (next) {
    const restaurant = this;

    // Assuming you have logic to calculate creditAmounts and debitAmounts
    // based on your application's requirements

    const creditTransactions = this.wallet.creditAmounts.map(amount => new Transaction({
        restaurant: restaurant._id,
        type: 'credit',
        amount
    }));

    const debitTransactions = this.wallet.debitAmounts.map(amount => new Transaction({
        restaurant: restaurant._id,
        type: 'debit',
        amount
    }));

    // Save transactions
    const savedTransactions = await Transaction.insertMany([...creditTransactions, ...debitTransactions]);

    // Update restaurant wallet balance
    const totalCredit = savedTransactions
        .filter(tx => tx.type === 'credit')
        .reduce((acc, tx) => acc + tx.amount, 0);

    const totalDebit = savedTransactions
        .filter(tx => tx.type === 'debit')
        .reduce((acc, tx) => acc + tx.amount, 0);

    restaurant.wallet.balance = totalCredit - totalDebit;

    // Update transaction history
    restaurant.wallet.transactionHistory.push(...savedTransactions.map(tx => tx._id));

    next();
});



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
            description: req.body.description,
            delivaryTime:{
                minTime: req.body.minTime,
                maxTime: req.body.maxTime
            },
            ref:req.body.ownerId

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
