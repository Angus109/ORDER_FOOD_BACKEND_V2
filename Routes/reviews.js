const express = require('express')
const router = express.Router()
const {getReviews, creatReview} = require("../Models/reviews")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const authorization = require("../Middleware/auth")




router.get("/", authorization, asyncMiddleware(async function (req, res) {


    const {result, code}= getReviews(res)
    return res.status(code).send(result)
})

)



router.post("/", authorization, asyncMiddleware(async function (req, res) {
    
  
    if (!req.userId){
        return  res.status(400).send({success: false, error: "userId is required!" })
    }

    
    if (!req.restaurantId){
        return  res.status(400).send({success: false, error: "restaurantId is required!" })
    }
    if (!req.rating){
        return  res.status(400).send({success: false, error: "rating is required!" })
    }

    const {result, code}= creatReview(res)
    return res.status(code).send(result)
})

)


module.exports= router