const express = require('express')
const router = express.Router()
const {createlocation, getLocation} = require("../Models/locations")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const auth = require('../Middleware/auth')



router.get('/' , auth , asyncMiddleware(async function (req, res) {
    const result = await getLocation()
    res.status(200).send(result)
}))

router.post('/', auth, asyncMiddleware(async function (req, res){
    // const {name, zone} =req.body
    console.log(req.body)

    if(!req.body.name){
        return res.status(400).send({error :'location name is required'})
    }
    if (!req.body.zone){
        return res.status(400).send({error :"zone is a required field"})
    }
    if(!req.body.province){
        return res.status(400).send({error: 'province is a required field'})
    }
    const { code, result } = await createlocation(req.body)
    res.status(code).send(result)
}))

module.exports = router