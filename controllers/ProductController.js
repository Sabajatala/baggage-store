const Product = require('../models/product');
const Category = require('../models/category');
const Audit = require('../models/audit');

exports.getAllProducts = async (req, res) => {
  try {
    let query = {};
    if (req.query.category) {
      query.category = req.query.category;
    }
    const products = await Product.find(query).populate('category', 'name image');
    res.status(200).json(products);
  } catch (err) {
    console.error('Get all products error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name image');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!product.category) {
      return res.status(500).json({ message: 'Category population failed; category may not exist' });
    }
    res.status(200).json(product);
  } catch (err) {
    console.error('Get product by ID error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createProduct = async (req, res) => {
  const { categoryName, name, price, description, images } = req.body;
  if (!categoryName || !name || !price || !description || !images || images.length === 0) {
    return res.status(400).json({ message: 'All fields are required, including at least one image' });
  }
  try {
    const category = await Category.findOne({ name: { $regex: `^${categoryName}$`, $options: 'i' } });
    if (!category) {
      return res.status(404).json({ message: `Category '${categoryName}' not found` });
    }
    const newProduct = new Product({ category: category._id, name, price, description, images });
    await newProduct.save();

    const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name image');
    if (!populatedProduct.category) {
      return res.status(500).json({ message: 'Category population failed; category may not exist' });
    }

    // Log to audit
    const audit = new Audit({
      user: req.user.email || 'admin',
      action: 'Product Added',
      details: `Product: ${name}, Category: ${categoryName}`
    });
    await audit.save();

    res.status(201).json(populatedProduct);
  } catch (err) {
    console.error('Create product error:', err);
    res.status(400).json({ message: 'Error creating product', error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.categoryName) {
      const category = await Category.findOne({ name: { $regex: `^${updateData.categoryName}$`, $options: 'i' } });
      if (!category) {
        return res.status(404).json({ message: `Category '${updateData.categoryName}' not found` });
      }
      updateData.category = category._id;
      delete updateData.categoryName;
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name image');
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (!updatedProduct.category) {
      return res.status(500).json({ message: 'Category population failed; category may not exist' });
    }

    // Log to audit
    const audit = new Audit({
      user: req.user.email || 'admin',
      action: 'Product Updated',
      details: `Product ID: ${req.params.id}, Name: ${updateData.name}`
    });
    await audit.save();

    res.status(200).json(updatedProduct);
  } catch (err) {
    console.error('Update product error:', err);
    res.status(400).json({ message: 'Error updating product', error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Log to audit
    const audit = new Audit({
      user: req.user.email || 'admin',
      action: 'Product Deleted',
      details: `Product ID: ${req.params.id}`
    });
    await audit.save();

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// const Product = require('../models/product');
// const Category = require('../models/category');

// exports.getAllProducts = async (req, res) => {
//   try {
//     let query = {};
//     if (req.query.category) {
//       query.category = req.query.category;
//     }
//     const products = await Product.find(query).populate('category', 'name image');
//     res.status(200).json(products);
//   } catch (err) {
//     console.error('Get all products error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.getProductById = async (req, res) => {
//   try {
//     const product = await Product.findById(req.params.id).populate('category', 'name image');
//     if (!product) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     if (!product.category) {
//       return res.status(500).json({ message: 'Category population failed; category may not exist' });
//     }
//     res.status(200).json(product);
//   } catch (err) {
//     console.error('Get product by ID error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

// exports.createProduct = async (req, res) => {
//   const { categoryName, name, price, description, images } = req.body;
//   if (!categoryName || !name || !price || !description || !images || images.length === 0) {
//     return res.status(400).json({ message: 'All fields are required, including at least one image' });
//   }
//   try {
    
//     const category = await Category.findOne({ name: { $regex: `^${categoryName}$`, $options: 'i' } });
//     if (!category) {
//       return res.status(404).json({ message: `Category '${categoryName}' not found` });
//     }
//     const newProduct = new Product({ category: category._id, name, price, description, images });
//     await newProduct.save();
    
//     const populatedProduct = await Product.findById(newProduct._id).populate('category', 'name image');
//     if (!populatedProduct.category) {
//       return res.status(500).json({ message: 'Category population failed; category may not exist' });
//     }
//     res.status(201).json(populatedProduct);
//   } catch (err) {
//     console.error('Create product error:', err);
//     res.status(400).json({ message: 'Error creating product', error: err.message });
//   }
// };

// exports.updateProduct = async (req, res) => {
//   try {
//     const updateData = { ...req.body };
  
//     if (updateData.categoryName) {
//       const category = await Category.findOne({ name: { $regex: `^${updateData.categoryName}$`, $options: 'i' } });
//       if (!category) {
//         return res.status(404).json({ message: `Category '${updateData.categoryName}' not found` });
//       }
//       updateData.category = category._id;
//       delete updateData.categoryName;
//     }
//     const updatedProduct = await Product.findByIdAndUpdate(
//       req.params.id,
//       updateData,
//       { new: true, runValidators: true }
//     ).populate('category', 'name image');
//     if (!updatedProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     if (!updatedProduct.category) {
//       return res.status(500).json({ message: 'Category population failed; category may not exist' });
//     }
//     res.status(200).json(updatedProduct);
//   } catch (err) {
//     console.error('Update product error:', err);
//     res.status(400).json({ message: 'Error updating product', error: err.message });
//   }
// };

// exports.deleteProduct = async (req, res) => {
//   try {
//     const deletedProduct = await Product.findByIdAndDelete(req.params.id);
//     if (!deletedProduct) {
//       return res.status(404).json({ message: 'Product not found' });
//     }
//     res.status(200).json({ message: 'Product deleted successfully' });
//   } catch (err) {
//     console.error('Delete product error:', err);
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

