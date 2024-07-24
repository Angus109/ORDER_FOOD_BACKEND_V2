const express = require("express")
const asyncMiddleware = require("../Middleware/asyncMiddleware")
const { createUser, loginUser } = require("../Models/user")
const router = express.Router()

router.post("/register", asyncMiddleware(async function (req, res) {
  const { email, password , name} = req.body;

  // Check if email and password are present
  if (!email || !password) {
    return res.status(400).send({success:false, error: "Missing email or password" });

  }
  if (!name) {
    return res.status(400).send({success: false, error: "name is a requireed field"})
  }

  const { result, code } = await createUser(req.body);
  res.header("x-auth-token", result.token).status(code).send(result);
}))


router.post("/login", asyncMiddleware(async function (req, res) {


    if (!req.body) return res.status(400).send({success: false, error:"email and password is required"})
    const { email, password } = req.body
    if (!email) return res.status(400).send({success:false, error: "email is a required field!"})
    if (!password) return res.status(400).send({success:false, error: "password is required field!"})
    const { code , result} = await loginUser(req.body)
    res.header("x-auth-token", result.token).status(code).send(result)
}))

module.exports = router