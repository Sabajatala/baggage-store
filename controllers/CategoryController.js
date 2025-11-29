const Category = require('../models/category');
const Audit = require('../models/audit');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error('Error fetching category by ID:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    res.status(500).json({ message: 'Failed to fetch category', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    // Check for existing category (case-insensitive)
    const existingCategory = await Category.findOne({ name: new RegExp(`^${name}$`, 'i') });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    const category = new Category({ name, image });
    await category.save();

    const audit = new Audit({
      user: req.user?.email || 'admin',
      action: 'Category Added',
      details: `Category: ${name}`
    });
    await audit.save();

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error.message);
    res.status(500).json({ message: 'Failed to create category', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name) return res.status(400).json({ message: 'Category name is required' });

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    // Check for duplicate name (excluding current category)
    const existingCategory = await Category.findOne({
      name: new RegExp(`^${name}$`, 'i'),
      _id: { $ne: req.params.id }
    });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    category.name = name;
    category.image = image;
    await category.save();

    const audit = new Audit({
      user: req.user?.email || 'admin',
      action: 'Category Updated',
      details: `Category ID: ${req.params.id}, Name: ${name}`
    });
    await audit.save();

    res.status(200).json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    res.status(500).json({ message: 'Failed to update category', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const audit = new Audit({
      user: req.user?.email || 'admin',
      action: 'Category Deleted',
      details: `Category ID: ${req.params.id}`
    });
    await audit.save();

    res.status(200).json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error.message);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid category ID' });
    }
    res.status(500).json({ message: 'Failed to delete category', error: error.message });
  }
};