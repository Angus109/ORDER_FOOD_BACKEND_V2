const express = require('express')
const router = express.Router()
const {createCart, getcart, updateCart, removeCart} = require("../Models/cart")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const authorization = require("../Middleware/auth")


router.get('/:_userId' , authorization, asyncMiddleware(async function (req, res) {
    if(!req.params._userId){
        return res.status(400).send({success: false, error:"param userId is required field!"})
    }

    
    const {result, code} = await getcart(req.params._id)
    res.status(code).send(result)
})) 


router.delete('/:_id' , authorization, asyncMiddleware(async function (req, res) {
   //check the qury pam for cart id 
    if (!req.params._id || req.params._userId == "" ){
        return res.status(400).send({success: false, error :"query param id is a required field!"})
    }

    //check if userId exixt the the req body 
    if(!req.body.userId){
        return res.status(400).send({success:false, error :"userid is a required field!"})
    }
    const {result, code} = await removeCart(req)
    res.status(code).send(result)
})) 

router.put('/:_id' , authorization, asyncMiddleware(async function (req, res) {
    // console.log(req.params)
    // console.log(req.query.search)
    const {code, result} = await updateCart(req.params._id)
    res.status(code).send(result)
})) 

router.post('/', authorization, asyncMiddleware(async function (req, res) {
    if (!req.body.productId){
        return res.status(400).send({success: false, error:"productId is required"})
    }

    if(!req.body.quantity){
        return res.status(400).send({success: false, error:"quantity is required"})
    }
    if(!req.body.price){
        return res.status(400).send({ success:false, error :'price is a required field'})
    }
    if (!req.body.userId){
        return res.status(400).send({success: false, error : 'userId is a required field!'})
    }
    const { code, result } = await createCart(req.body)
    res.status(code).send(result)
}))

module.exports = router