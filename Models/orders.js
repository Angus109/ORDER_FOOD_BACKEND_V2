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
const placeOrder = async (req,res) => {

    const frontend_url = "http://localhost:5173";

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

        res.json({success:true,session_url:session.url})

    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }   
}

const verifyOrder = async (req,res) => {
    const {orderId,success} = req.body;
    try {
        if (success=="true") {
            await OrderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await OrderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


// user orders for frontend

const userOrders = async (req,res) => {
    try {
        const orders = await OrderModel.find({userId:req.body.userId});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// Listing orders for admin panel
const listOrders = async (req,res) => {
    try {
        const orders = await OrderModel.find({});
        res.json({success:true,data:orders})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}

// api for updating order status
const updateStatus = async (req,res) => {
    try {
        await OrderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status});
        res.json({success:true,message:"Status Updated"})
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}


module.exports.placeOrder = placeOrder
module.exports.verifyOrder = verifyOrder
module.exports.userOrders = userOrders
module.exports.listOrders = listOrders
module.exports.updateStatus = updateStatus
// export {placeOrder,verifyOrder,userOrders,listOrders,updateStatus}