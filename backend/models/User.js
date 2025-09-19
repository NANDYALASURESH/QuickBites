const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem", required: true },
  quantity: { type: Number, default: 1, min: 1 }
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  phone:    { type: String },
  address:  { type: String },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "admin", "delivery"], default: "user" },

  // ➡️ New field
  cart: [cartItemSchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
