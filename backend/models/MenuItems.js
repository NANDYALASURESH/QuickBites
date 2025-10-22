const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['veg', 'nonveg'], required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 },
  image: { type: String },
  prepTime: { type: String },
  popular: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("MenuItem", menuItemSchema);