const mongoose = require('mongoose');

const checkoutSchema = new mongoose.Schema({
  user: {
    type: {
      _id: {
        type: String, // Changed from ObjectId to String
        required: true
      },
      name: String,
      email: String,
      phone: String,
      location: String
    },
    required: true
  },
  items: [{
    _id: {
      type: String, // Changed from ObjectId to String
      required: true
    },
    name: String,
    image: String,
    price: Number,
    quantity: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'delivered'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Checkout', checkoutSchema);

// const mongoose = require('mongoose');

// const checkoutSchema = new mongoose.Schema({
//   user: {
//     name: { type: String, required: true },
//     email: { type: String, required: true },
//     phone: { type: String, required: true },
//     location: { type: String, required: true }
//   },
//   items: [{
//     _id: { type: String }, 
//     name: { type: String, required: true },
//     image: { type: String, required: true },
//     price: { type: Number, required: true },
//     quantity: { type: Number, required: true, min: 1 }
//   }],
//   createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model('Checkout', checkoutSchema);