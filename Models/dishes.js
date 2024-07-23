const mongoose = require("mongoose")

const dishSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    unique: true
  },
  image: {
    public_id:{
      type: String,
      required: true

    },
    url:{
      type:String,
      required: true
    }
  },
  rating: Number,
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories"
  }],
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Resturent",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});


// Mongoose Middleware to Enforce Restaurant Dish Limit

dishSchema.pre('save', async function (next) {
  const dish = this; // Refers to the current dish being saved

  // Check if the dish limit has been reached for the parent restaurant
  const existingDishCount = await Dish.countDocuments({ parentId: dish.parentId });
  if (existingDishCount >= 3) {
    const error = new Error('Maximum of 3 dishes allowed per restaurant');
    error.statusCode = 400; // Bad Request
    return next(error);
  }

  next(); // Continue with saving the dish if limit is not reached
});



const Dish = mongoose.model("Dish", dishSchema)



const searchdishes = async function (search) {
  if (search) {

    const result = await Dish.find(search).populate({
      path: 'categories',
    })
    return {code:200, result : {
      success: true,
      result: result
    }}

  }else{
    const result = await Dish.find({})
    return {code:200, result: {
      success: true,
      result: result
    }}
  }


}



const getdishes = async function (id) {
  if (id) {
    try {
      const restaurantId = id; // Assuming restaurant ID is in request params

      // Validate restaurant ID (optional but recommended)
      if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
        return { code: 400, result: {
          success: false,
          error:'Invalid restaurant ID'
        } }
      }

      const dishes = await Dish.find({ parentId: restaurantId }); // Filter by parentId

      if (!dishes.length) {
        return { code: 200, result:{
           success: false,
           error: 'No dishes found for this restaurant'
        }}
      }

      return { code: 200, result: {
        success: true,
        result: dishes
      } }

    } catch (error) {
      console.error(error);
      return { code: 200, result: {
        success: false,
        error: error
      } }

    }
  } else {
    const response = await Dish.find({})
    return { code: 200, result: {
      success: true,
      result: response
    } }
  }



}

const createdishs = async function (req, cloudinaryResponseForDish) {
  try {
    const dish = new Dish({
      name: req.body.name,
      description: req.body.description,
      categories : req.body.category,
      rating: "",
      price: req.body.price,
      image: {
        public_id: cloudinaryResponseForDish.public_id,
        url: cloudinaryResponseForDish.secure_url
      },
      parentId: req.body.parentId
    });
    const response = await dish.save()
    return { code: 200, result: {
      success: true,
      result: response
    } }
  } catch (error) {
    return { code: 400, result: {
      success: false,
      error: error
    } }
  }
}


const updatedishes = async function (req) {
  try {
    const dishId = req.params._id; // Assuming dish ID is in the request params

    // Validate dish ID (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(dishId)) {
      return {code:200, result:{
        success: false,
        error: 'Invalid dish ID'
      } }
    }

    const updatedDish = await Dish.findOneAndUpdate(
      { _id: dishId }, // Use _id for document ID
      req.body, // Update with entire request body (modify if needed)
      { new: true } // Return the updated dish document
    );

    if (!updatedDish) {
      return {code:404, result:{
        success: false,
        error: 'Dish not found'
      }}
    }

    return {code:200,  result: {
      success: true,
      message: 'Dish updated successfully',
      result: updatedDish
    } }
  } catch (error) {
    console.error(error);
    return {code:500, result:{
      success: false,
      error: error
    }}
  
  }
};


const deletedishes = async function (id) {
  try {
    // Validate ID (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return {code:400, result:{
        success: false,
        message: 'Invalid dish ID'
      } }
    }

    const deletedDish = await Dish.findByIdAndDelete(id);

    if (!deletedDish) {
      return {code:404, result:{
        success: false,
         message: 'Dish not found'
      }}
    }

    // Handle dependent documents (optional)
    // If your dishes have dependent documents (e.g., orders), 
    // you might need additional logic here to handle them before deletion.

    return {code:200, result:{
      success: true,
      message: 'Dish deleted successfully',
      result: deletedDish
    } }
  } catch (error) {
    return {code:500, result:{
      success: false,
      error: error
    }}
  }
};




module.exports.createdish = createdishs
module.exports.getdishes = getdishes
module.exports.updatedishes = updatedishes
module.exports.deletedishes = deletedishes
module.exports.searchdishes = searchdishes