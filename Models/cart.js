const { response } = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



let ItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Dish",
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity can not be less then 1.']
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    default:0, 
    type: Number,
  }
}, {
  timestamps: true
})

const CartSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  items: [ItemSchema],
  subTotal: {
    default: 0,
    type: Number
  }
}, {
  timestamps: true
})



// Pre-save middleware to calculate subTotal
CartSchema.pre('save', async function(next) {
  this.subTotal = 0;
  for (const item of this.items) {
    await item.save(); // Ensure item totals are calculated first
    this.subTotal += item.total;
  }
  next();
});



ItemSchema.pre('save', function(next) {
  this.total = this.quantity * this.price;
  next();
});

module.exports = ItemSchema;










const Cart = mongoose.model('Cart', CartSchema);

const getcart = async function (id) {

  const result = await Cart.find().find({
    user: id,
  })
  return {
    code:200,
    result:{
      success:true,
      result: result,
      
    }
  }
}

const createCart = async function (body) {


  try {
    const total = body.quantity * body.price
    const cart = new Cart({
      user: body.userId,
      items: {
        productId: body.productId,
        quantity: body.quantity,
        price: body.price,
      }
    });

    const response = await cart.save()




    return { code: 200, result: response }
  } catch (error) {
    return { code: 400, result: {
      success:false,
      error: error
    }}

  }
}

const removeCart = async function (req) {
  try {
    const productId = req.params._id;
    const userId = req.body.userId;

    // Validate user ID and product ID (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return {code:200,
        result:{
          success:false,
          error: error
        }
      }
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { productId } } },
      { new: true } // Return the updated cart document
    );

    if (!cart) {
      return {code:404, result:{
        success:false,
        error:'Cart not found for the user'
      }}
    }

    // Update subTotal after removing item (optional)
    cart.subTotal = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    await cart.save(); // Persist the updated subTotal (if needed)

    return {code:200, result:{
      success:true,
      message: 'Item removed from cart successfully',
      result: cart,
      
    }}
  } catch (error) {
    console.error(error);
    return {code:400, result:{
      success: false,
      error: error
    }}
  }
};


const updateCart = async function (req) {
  try {
    const productId = req.params._id;
    const userId = req.body.userId;
    const quantity = req.body.quantity;

    // Validate user ID, product ID, and quantity (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId) || quantity < 0) {
      return {code:400, result:{
        success: false,
        error: 'Invalid user ID, product ID, or quantity'
      }}
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items.productId": productId },
      {
        $set: quantity < 1 ? { $unset: "items.$" } : { "items.$.quantity": quantity }, // Conditional update based on quantity
      },
      { new: true } // Return the updated cart document
    );

    if (!cart) {
      return {code: 400, result:{
        success: false,
        error: 'Cart not found for the user or product not found in cart'
      }}
    }

    // Update subTotal after updating quantity (optional)
    cart.subTotal = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    await cart.save(); // Persist the updated subTotal (if needed)

    return {code: 200, result:{
      success: true,
      result: cart,
      message: 'Cart item updated successfully'
    }}
  } catch (error) {
    console.error(error);
    return {
      code: 400, 
      result:{
        success: false,
        error: error
      }
    }
  }
};


module.exports.createCart = createCart
module.exports.getcart = getcart
module.exports.updateCart = updateCart
module.exports.removeCart = removeCart
module.exports.Cart = Cart