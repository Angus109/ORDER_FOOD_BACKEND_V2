const express = require('express')
const router = express.Router()
const { createdish, getdishes, updatedishes, deletedishes } = require("../Models/dishes")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const authorization = require("../Middleware/auth")
const storagecnt = require("../Middleware/storage")
const multer = require("multer")
const cloudinary = require("cloudinary")
const upload = multer({ storage: storagecnt })



router.get('/:_id', authorization, asyncMiddleware(async function (req, res) {
   // console.log(req.params)
   // console.log(req.query.search)
   if (req.params._id) {
      const result = await getdishes(req.params._id)
      return res.status(200).send(result)
   }
   const result = await getdishes()
   res.status(200).send(result)
}))

// delete router for Dishes
router.delete('/:_id', authorization, asyncMiddleware(async function (req, res) {
   // console.log(req.params)
   // console.log(req.query.search)

   if (!req.params._id || req.params.id === "") {
      return res.status(404).send({ error: 'dishId param is required field' })
   }
   const result = await deletedishes(req.params._id)
   res.status(200).send(result)
}))


// update router
router.put('/:_id', authorization, upload.single("image"), asyncMiddleware(async function (req, res) {
   // console.log(req.params)
   // console.log(req.query.search)
   if (!req.params._id) {
      return res.status(404).send({ error: 'query param id is required field' })
   }
   if (!res.body) {
      return res.status(404).send({ error: 'provide all required fields to update dishes' })
   }
   const result = await updatedishes(req)
   res.status(200).send(result)
}))

// create Dishes router
router.post('/', authorization, asyncMiddleware(async function (req, res) {
   const { name, price, description, parentId, categoryId } = req.body

   if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send({error: "Dish image is required "})

   }

   //POSTING Dish image
   const cloudinaryResponseForDish = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "ORDER FOOD DISH" }
   );
   if (!cloudinaryResponseForDish || cloudinaryResponseForDish.error) {
      console.error(
         "Cloudinary Error:",
         cloudinaryResponseForDish.error || "Unknown Cloudinary error"
      );
      return res.status(500).send({error: "Failed to upload avatar to Cloudinary"})
   }

   if(cloudinaryResponseForDish){
      console.log(cloudinaryResponseForDish)
     }




   if (!name) {
      return res.status(400).send({ error: "name is a required field!" })
   }
   if (!price) {
      return res.status(400).send({ error: "price is a required field!" })
   }
   if (!description) {
      return res.status(400).send({ error: "description is a required field!" })
   }
   if (!req.file) {
      return res.status(400).send({ error: "image is a required field!" })
   }

   if (!parentId || !categoryId) {
      return res.status(400).send({ error: "parentId and categoryId is a required field!" })
   }

   const { code, result } = await createdish(req, cloudinaryResponseForDish)
   res.status(code).send(result)
}))

module.exports = router