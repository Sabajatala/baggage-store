const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
    default: 'admin'
  },
  action: {
    type: String,
    required: true,
    enum: [
      'Category Added',
      'Category Updated',
      'Category Deleted',
      'Product Added',
      'Product Updated',
      'Product Deleted',
      'Checkout Status Updated'
    ]
  },
  details: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Audit', auditSchema);