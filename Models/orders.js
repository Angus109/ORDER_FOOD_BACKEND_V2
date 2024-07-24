const mongoose= require("mongoose")
const Stripe = require("stripe")
const { Cart }= require("../Models/cart.js")
const STRIPE_SECRET_KEY= process.env.STRIPE_SECRET_KEY || ""


const orderSchema = new mongoose.Schema({
    userId:{type:String,required:true},
    items:{type:Array,required:true},
    amount:{type:Number,required:true},
    address:{type:Object,required:true},
    status:{type:String,default:"Food Processing"},
    date:{type:Date,default:Date.now()},
    payment:{type:Boolean,default:false}
})

const OrderModel = mongoose.model("order",orderSchema)





const stripe = new Stripe(STRIPE_SECRET_KEY)


// placing user order from frontend
const placeOrder = async (req) => {

    const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173";

    try {
        const newOrder = new OrderModel({
            userId:req.body.userId,
            items:req.body.items,
            amount:req.body.amount,
            address:req.body.address
        })
        await newOrder.save();
        await Cart.findByIdAndUpdate(req.body.userId,{items:{}});

        const line_items = req.body.items.map((item)=>({
            price_data:{
                currency:"pkr",
                product_data:{
                    name:item.name
                },
                unit_amount:item.price*100*275
            },
            quantity:item.quantity
        }))

        line_items.push({
            price_data:{
                currency:"pkr",
                product_data:{
                    name:"Delivery Charges"
                },
                unit_amount:2*100*275
            },
            quantity:1
        })

        const session = await stripe.checkout.sessions.create({
            line_items:line_items,
            mode:'payment',
            success_url:`${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url:`${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })

        return {
            code:200,
            result: {
                success: true,
                result:session.url
            }
        }

    } catch (error) {
        console.log(error);
        return{
            code:500,
            result: {
                success: false,
                error: error
            }
        }
    }   
}

const verifyOrder = async (req) => {
    const {orderId,success} = req.body;
    try {
        if (success=="true") {
           const response = await OrderModel.findByIdAndUpdate(orderId,{payment:true});
            return {
                code: 200,
                result:{
                    success:true,
                    message:"Paid",
                    result : response
                }
            }
        }
        else{
            const response = await OrderModel.findByIdAndDelete(orderId);
            return {
                code: 200,
                result: {
                    success: true,
                    message:"Not Paid",
                    result : response
                }
            }
        }
    } catch (error) {
        console.log(error);
        return{
            code:500,
            result: {
                success: false,
                error: error
            }
        }
    }
}


// user orders for frontend

const userOrders = async (req) => {
    try {
        const orders = await OrderModel.find({userId:req.body.userId});
        return {
            code:200,
            result:{
                success: true,
                result: orders
            }
        }
    } catch (error) {
        console.log(error);
        return {
            code: 500,
            result: {
                success: false,
                error: error
            }
        }
    }
}

// Listing orders for admin panel
const listOrders = async () => {
    try {
        const orders = await OrderModel.find({});
        return {
            code:200,
            result:{
                success:true,
                result: orders
            }
            
        }
    } catch (error) {
        console.log(error);
       return{
        code:500,
        result:{
            success:false,
            error: error
        }
       }
    }
}

// api for updating order status
const updateStatus = async (req) => {
    try {
        const response = await OrderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        return {
            code: 200,
            result: {
                success: true,
                message:"Status Updated",
                result: response
            }
        }
    } catch (error) {
        console.log(error);
        return {
            code: 500,
            result:{
                success: false,
                error:error
            }
        }
    }
}


module.exports.placeOrder = placeOrder
module.exports.verifyOrder = verifyOrder
module.exports.userOrders = userOrders
module.exports.listOrders = listOrders
module.exports.updateStatus = updateStatus
// export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}