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
        return res.status(400).send({success:false, error : "nmae is a required field"})
    }else if(!email || !phone ){
        return res.status(400).send({success:false, error: "[phone and email is a required field"})
    }else if (!address){
        return res.status(400).send({success: false, error: "addres  is a require field"})
    }else if (!storeId || !dishId ){
        return res.status(400).send({success: false, error : 'storeid and dishId is a required field'})
    }else if(!ion || !lon ){
        return res.status(400).send({success: false, error: "lat and  lon is a required field"})
    }else{
        const {result, code} = await placeOrder(req.body)
    res.status(code).send(result)
    }
   
}) )

router.put('/update', isAuthenticated, asyncMiddleware( async function (req, res){
    const {id, status }= req.body
    if(!id){
        return res.status(400).send({success: false ,error: "id is a required field!"})
    }else if(!status){
        return res.status(400).send({success: false, error : "status is atrequired field!"})
    }else{
        const {result, code} = await updateStatus(req.body)
        res.status(code).send(result)
    }
}))

router.post('/verify', isAuthenticated, asyncMiddleware( async function (req, res){
    const {id, status }= req.body
    if(!id){
        return res.status(400).send({success: false, error: "id is a required field!"})
    }else if(!status){
        return res.statu(400).send({ success: false, error : "status is atrequired field!"})
    }else{
        const {code, result} = await verifyOrder(req.body)
        res.status(code).send(result)
    }
}))

router.post('/user/orders', isAuthenticated, asyncMiddleware( async function (req, res){


        const {result, code} = await userOrders(req.body)
        res.status(code).send(result)

}))

router.post('/vendor/orders', isAuthenticated, asyncMiddleware( async function (req, res){

        const {result, code} = await listOrders(req.body)
        res.status(code).send(result)

}))


module.exports = router