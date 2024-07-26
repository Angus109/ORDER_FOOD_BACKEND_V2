const mongoose = require("mongoose")


const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurant: {
        type: mongoose.Schema.Types.ObjectId,

        ref: 'Restaurant',
        required: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,

        required: true
    },
    comment: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Review = mongoose.model('Review', reviewSchema);


const getReviews = async function (res) {
    try{
        const response = await Resturent.find(res.restaurantId)
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

const creatReview = async function (res) {
    try{
        const review = new Review({
            user: res.userId,
            restaurant: res.restaurantId,
            rating: res.rating,
            comment: res.comment? res.comment : ""

        });
        const response = await review.save()
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

module.exports.getReviews=getReviews
module.exports.creatReview=creatReview






