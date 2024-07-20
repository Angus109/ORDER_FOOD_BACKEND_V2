const express = require('express')
const app = express()
const cors = require("cors")
const dotenv = require("dotenv")
const fileUpload = require("express-fileupload")
const cloudinary = require("cloudinary")


app.use(express.json());
app.use(express.urlencoded({ extended: true }));  
app.use(cors())
dotenv.config({ path: ".env" });


app.use(
    fileUpload({
      useTempFiles: true,
      tempFileDir: "/tmp/",
    })
  );
  
  cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
  });
  

const error = require("./Middleware/errorMiddleware")
const items = require("./Routes/items")
const user = require("./Routes/user")
const location = require("./Routes/locations")
const categories = require("./Routes/categories")
const resturents = require("./Routes/resturents")
const dishes = require("./Routes/dishes")
const cart = require("./Routes/cart")


app.use(`/api/v1/items`, items)
app.use(`/api/v1/user`, user)
app.use(`/api/v1/locations`, location)
app.use(`/api/v1/categories`, categories)
app.use(`/api/v1/resturents`, resturents)
app.use(`/api/v1/dishes`, dishes)
app.use(`/api/v1/cart`, cart)
app.use(error)

require("./startup/db")()
require("./startup/config")()

const port = process.env.PORT || 5000 || 3500 || 4000
app.listen(port, ()=>{
    console.log(`listening to ${port}!`)
})