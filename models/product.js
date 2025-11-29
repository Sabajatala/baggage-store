const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  images: {
    type: [String],
    required: true,
    validate: [arrayLimit, 'At least one image is required']
  }
}, {
  timestamps: true
});

function arrayLimit(val) {
  return val.length > 0;
}
module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);