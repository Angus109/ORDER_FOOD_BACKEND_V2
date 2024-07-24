const express = require('express')
const router = express.Router()
const { createcategories, getcategoriess, deleteCategories } = require("../Models/categories")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const authorization = require("../Middleware/auth")
// const storagecnt = require("../Middleware/storage")
// const multer = require("multer")
const cloudinary = require("cloudinary")



// const upload = multer({storage:storagecnt})



router.get('/', authorization, asyncMiddleware(async function (req, res) {
    const {result, code} = await getcategoriess()
    res.status(code).send(result)
}))

router.delete('/:_id', authorization, asyncMiddleware(async function (req, res) {
    if (!req.params._id){
        return res.status(400).send({ succes:false, error :'category _id is a required field'})
    }

    if (req.params._id){
        console.log({result : req.params._id})
    }
    
    const {result, code} = await deleteCategories(req.params._id)
    res.status(code).send(result)
}))



router.post('/', authorization, asyncMiddleware(async function (req, res) {

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({succes: false, error: "category image is required "})
  
     }


     if (!req.body.name){
        return res.status(400).send({succes:false, error: "name is a required field!" })
    }
    if (!req.files) {
        return res.status(400).send({succes: false, error: "image is a required field!" })
    }
  
     //POSTING Dish image
     const cloudinaryResponseForCategory = await cloudinary.uploader.upload(
        req.files.image.tempFilePath,
        {folder: "ORDER FOOD CATEGORIES" }
     );
     if (!cloudinaryResponseForCategory || cloudinaryResponseForCategory.error) {
        console.error(
           "Cloudinary Error:",
           cloudinaryResponseForCategory.error || "Unknown Cloudinary error"
        );
        return res.status(500).send({success: false, error: "Failed to upload category to Cloudinary"})
     }
  
     if(cloudinaryResponseForCategory){
        console.log(cloudinaryResponseForCategory)
       }





    const { result, code } = await createcategories(req, cloudinaryResponseForCategory)
    res.status(code).send(result)

}
))

module.exports = router
