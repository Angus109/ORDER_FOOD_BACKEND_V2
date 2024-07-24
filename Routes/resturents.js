const express = require('express')
const router = express.Router()
const {getresturents, getallrestaurants, createresturent} = require("../Models/resturents")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const authorization = require("../Middleware/auth")
const storagecnt = require("../Middleware/storage")
const multer = require("multer")
const cloudinary = require("cloudinary")


const upload = multer({storage:storagecnt})

router.get('/:_search' , authorization,  asyncMiddleware(async function (req, res) {

    // console.log(req.params)
    // console.log(req.query.search)
    const search = req.params._search 
    const {result, code} = await getresturents(search)
    res.status(code).send(result)
}))

router.get('/all' , authorization,  asyncMiddleware(async function (req, res) {

    const {result, code} = await getallrestaurants()
    res.status(code).send(result)

}))



router.post('/', authorization, asyncMiddleware(async function (req, res) {
    const {name , categoryId, cityId, address, lat, lon, description}= req.body

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({success: false, error: "Dish image is required "})
  
     }


     if (!name || !address){
        return  res.status(400).send({success: false, error: "restauarant name and address required!" })
    }

     if(!cityId){
        return res.status(400).send({success: false, error: "cityId is required!" })
    }

    if(!lat || !lon) {
        return res.status(400).send({success: false, error: "lat & lon is a required field"})
    }

    if(!categoryId) {
        return res.status(400).send({ success: false, error: "categoryId is required"})
    }

    if(!description){
        return res.status(400).send({success: false, error: "description is required"})
    }

  
     //POSTING Dish image
     const cloudinaryResponseForRestaurants = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        { folder: "ORDER FOOD RRESTAURANTS" }
     );
     if (!cloudinaryResponseForRestaurants || cloudinaryResponseForRestaurants.error) {
        console.error(
           "Cloudinary Error:",
           cloudinaryResponseForRestaurants.error || "Unknown Cloudinary error"
        );
        return res.status(500).send({ success: false, error: "Failed to upload avatar to Cloudinary"})
     }
  
     if(cloudinaryResponseForDish){
        console.log(cloudinaryResponseForDish)
       }
  
  




    
        const { result, code } = await createresturent(req, cloudinaryResponseForRestaurants)
        res.status(code).send(result)
    

  
}))

module.exports = router