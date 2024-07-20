const multer = require("multer");

module.exports =  multer.diskStorage({
        destination:"uploads",
        filename:(req,file,cb)=>{
            return cb(null,`${Date.now()}${file.originalname}`)
        }
    })


