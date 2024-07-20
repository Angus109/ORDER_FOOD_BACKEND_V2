const express = require('express')
const router = express.Router()
const {createCart, getcart, updateCart, removeCart} = require("../Models/cart")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const authorization = require("../Middleware/auth")


router.get('/:_id' , authorization, asyncMiddleware(async function (req, res) {
    // console.log(req.params)
    // console.log(req.query.search)
    const result = await getcart(req.params._id)
    res.status(200).send(result)
})) 


router.delete('/:_id' , authorization, asyncMiddleware(async function (req, res) {
   //check the qury pam for cart id 
    if (!req.params._id){
        return res.status(404).send({status: "failed", error :"query param id is a required field!"})
    }

    //check if userId exixt the the req body 
    if(!req.body.userId){
        return res.status(404).send({status: "failed", error :"userid is a required field!"})
    }
    const result = await removeCart(req)
    res.status(200).send(result)
})) 

router.put('/:_id' , authorization, asyncMiddleware(async function (req, res) {
    // console.log(req.params)
    // console.log(req.query.search)
    const result = await updateCart(req.params._id)
    res.status(200).send(result)
})) 

router.post('/', authorization, asyncMiddleware(async function (req, res) {
    if (!req.body.productId){
        return res.status(404).send({error:"productId is required"})
    }

    if(!req.body.quantity){
        return res.status(404).send({error:"quantity is required"})
    }
    if(!req.body.price){
        return res.status(404).send({error :'price is a required field'})
    }
    if (!req.body.userId){
        return res.status(404).send({error : 'userId is a required field!'})
    }
    const { code, result } = await createCart(req.body)
    res.status(code).send(result)
}))

module.exports = router