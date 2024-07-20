const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken")

const JWT_SECRET_KEY = process.env.JWT_TOKEN;

const userSchema = new mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    phone : {
        type : Number,
        required: true
    },
    type:{
        //type 1 is user, type 2= vendor , type 3= admin
        type: Number,
        required: true,
    },
    v:{
       default:0,
       type: Number
    }
    
});

userSchema.methods.generateToken = function(){
    const token = jwt.sign({ _id: this._id }, JWT_SECRET_KEY)
    return token
}

userSchema.statics.findUserDetails = async (body) => {
    const finduser = await User.findOne(body)
    return finduser
}

const User = mongoose.model("User", userSchema)

const createUser = async function (body) {
    try {
        const salt = await bcrypt.genSalt(15)
        body.password = await bcrypt.hash(body.password, salt)
        const user = new User(body)
        const result = await user.save()
        const token = new User(result).generateToken()
        return { code: 200, result, token }
    } catch (error) {
        return { code: 400, result: error }
    }
}

const loginUser = async function (body) {
    const { email, password } = body
    const user = await User.findUserDetails({ email })
    if (!user) return { code: 400, result: "user not found" }
    const login = await bcrypt.compare(password, user.password)
    if (!login) return { code: 400, result: "eamil id or password can't match" }
    const token = new User(user).generateToken()
    return { code: 200, result: user, token }
}


module.exports.createUser = createUser
module.exports.loginUser = loginUser
module.exports.User= User
