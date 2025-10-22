const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  phone: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["pending", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"], 
    default: "pending" 
  },
  paymentMethod: { type: String, enum: ["cash", "card", "upi"], default: "cash" },
  orderDate: { type: Date, default: Date.now }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin", "delivery"], default: "user" },
  cart: [cartItemSchema],
  orders: [orderSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);