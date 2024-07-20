const express = require('express')
const router = express.Router()
const {createItem} = require("../Models/items")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const auth = require('../Middleware/auth')

router.get('/' , asyncMiddleware(async function (req, res) {
    res.send('Hello World')
}))

router.post('/', auth, asyncMiddleware(async function (req, res) {
    const { code, result } = await createItem(req.body)
    res.status(code).send(result)
}))

module.exports = router