
const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique:true,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});
module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);