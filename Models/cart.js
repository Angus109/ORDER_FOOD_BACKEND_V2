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
  return result[0]
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
    return { code: 400, result: error }

  }
}

const removeCart = async function (req) {
  try {
    const productId = req.params._id;
    const userId = req.body.userId;

    // Validate user ID and product ID (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: 'Invalid user ID or product ID' });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { productId } } },
      { new: true } // Return the updated cart document
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user' });
    }

    // Update subTotal after removing item (optional)
    cart.subTotal = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    await cart.save(); // Persist the updated subTotal (if needed)

    return res.status(200).json({ message: 'Item removed from cart successfully', cart }); // Send updated cart (optional)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error removing item from cart' });
  }
};


const updateCart = async function (req) {
  try {
    const productId = req.params._id;
    const userId = req.body.userId;
    const quantity = req.body.quantity;

    // Validate user ID, product ID, and quantity (optional but recommended)
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId) || quantity < 0) {
      return res.status(400).json({ message: 'Invalid user ID, product ID, or quantity' });
    }

    const cart = await Cart.findOneAndUpdate(
      { user: userId, "items.productId": productId },
      {
        $set: quantity < 1 ? { $unset: "items.$" } : { "items.$.quantity": quantity }, // Conditional update based on quantity
      },
      { new: true } // Return the updated cart document
    );

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found for the user or product not found in cart' });
    }

    // Update subTotal after updating quantity (optional)
    cart.subTotal = cart.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    await cart.save(); // Persist the updated subTotal (if needed)

    return res.status(200).json({ message: 'Cart item updated successfully', cart }); // Send updated cart (optional)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error updating cart item quantity' });
  }
};


module.exports.createCart = createCart
module.exports.getcart = getcart
module.exports.updateCart = updateCart
module.exports.removeCart = removeCart
module.exports.Cart = Cart