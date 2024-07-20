const express = require("express")
const router = require("../startup/router")
const placeOrder = require("../Models/orders")
const verifyOrder = require("../Models/orders")
const userOrders = require("../Models/orders")
const listOrders = require("../Models/orders")
const updateStatus = require("../Models/orders")
const isAuthenticated = require('../Middleware/auth')
const asyncMiddleware = require("../Middleware/asyncMiddleware")
// export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}
router = express.Router()


router.post("/placeorder", isAuthenticated, asyncMiddleware(async function(req, res){
    const {name,email,phone,address, storeId, dishId,lat, lon} = req.body 
    if (!name) {
        return res.status(200).send({error : "nmae is a required field"})
    }else if(!email || !phone ){
        return res.status(400).send({error: "[phone and email is a required field"})
    }else if (!address){
        return res.status(404).send({erroe: "addres  is a require field"})
    }else if (!storeId || !dishId ){
        return res.status(404).send({error : 'storeid and dishId is a required field'})
    }else if(!ion || !lon ){
        return res.status(404).send({eror: "lat and  lon is a required field"})
    }else{
        const result = await placeOrder(req.body)
    res.status(200).send(result)
    }
   
}) )

router.put('/update', isAuthenticated, asyncMiddleware( async function (req, res){
    const {id, status }= req.body
    if(!id){
        return res.status(404).send({error: "id is a required field!"})
    }else if(!status){
        return res.statu(404).send({error : "status is atrequired field!"})
    }else{
        const result = await updateStatus(req.body)
        res.status(200).send(result)
    }
}))

router.post('/verify', isAuthenticated, asyncMiddleware( async function (req, res){
    const {id, status }= req.body
    if(!id){
        return res.status(404).send({error: "id is a required field!"})
    }else if(!status){
        return res.statu(404).send({error : "status is atrequired field!"})
    }else{
        const result = await verifyOrder(req.body)
        res.status(200).send(result)
    }
}))

router.post('/user/orders', isAuthenticated, asyncMiddleware( async function (req, res){


        const result = await userOrders(req.body)
        res.status(200).send(result)

}))

router.post('/vendor/orders', isAuthenticated, asyncMiddleware( async function (req, res){

        const result = await listOrders(req.body)
        res.status(200).send(result)

}))


module.exports = router