const jwt = require("jsonwebtoken")
const config = require("config")
const { User} = require("../Models/user")
module.exports = async function auth(req, res, next) {

    const JWT_SECRET_KEY = process.env.JWT_TOKEN;
    const token = req.header("x-auth-token")
    if (!token) return res.status(400).send({success : false, error: "Please login"})
    try {
        const user = jwt.verify(token, JWT_SECRET_KEY)
        // console.log(user)
        req.user = await User.findById(user._id)
        next()
    } catch (error) {res.send({success: false, error: error})}
}