const config = require("config")

module.exports = function () {
    const jwt = process.env.JWT_TOKEN
        if (!jwt) {
        console.log("jwt token isn't defined")
        process.exit(1)
    }
}