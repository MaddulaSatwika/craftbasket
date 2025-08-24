import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";
  const { userId, items, amount, address } = req.body;

  try {
    // Save order to DB
    const newOrder = new orderModel({
      userId,
      items,
      amount,
      address,
    });
    await newOrder.save();

    // Clear cart
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    // Create Razorpay Order
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_order_${newOrder._id}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      razorpayOrderId: order.id,
      orderId: newOrder._id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID, // Send key to frontend for Checkout
    });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Order failed" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, paymentId, success } = req.body;

  try {
    if (success) {
      await orderModel.findByIdAndUpdate(orderId, {
        payment: true
      });
      res.json({ success: true, message: "Payment successful, order updated." });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: true, message: "Payment failed, order deleted." });
    }
  } catch (error) {
    console.error("Payment update error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const userOrders = async(req,res)=>{
  try{
    const orders = await orderModel.find({userId:req.body.userId,payment:true})
    res.json({success:true,data:orders})
  }catch(error){
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

// listing orders for admin panel
const listOrders = async(req ,res)=>{
  try {
    const orders = await orderModel.find({});
    res.json({success:true,data:orders})
  } catch (error) {
    console.log(error);
    res.json({success:false,message:"Error"})
  }
}

//api for updating order status
const updateStatus = async (req , res)=>{
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
    res.json({success:true,message:"Status Updated"})
  } catch (error) {
   console.log(error);
   res.json({success:false,message:"Error"}) 
  }
}

export { placeOrder,verifyOrder,userOrders,listOrders,updateStatus};
