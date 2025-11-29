const express = require('express');

// Insert product into session
const sessionProductInsert = (req, res) => {
  const { name, image, price, quantity = 1 } = req.body;

  if (!name || !image || !price) {
    return res.status(400).json({
      status: 0,
      message: 'Name, image, and price are required'
    });
  }

  if (!req.session.products) {
    req.session.products = [];
  }

  const product = {
    _id: Date.now().toString(),
    name,
    image,
    price: parseFloat(price),
    quantity: parseInt(quantity) || 1 // Default to 1 if invalid
  };

  req.session.products.push(product);

  req.session.save((err) => {
    if (err) {
      console.error(`Session save error for ${req.sessionID}:`, err);
      return res.status(500).json({
        status: 0,
        message: 'Error saving session'
      });
    }
    console.log(`Product added to session ${req.sessionID}:`, product);
    res.status(200).json({
      status: 1,
      message: 'Product saved in session',
      data: req.session.products
    });
  });
};

// List session products
const sessionProductList = (req, res) => {
  const products = req.session.products || [];
  console.log(`Session products fetched for ${req.sessionID}:`, products);
  res.status(200).json({
    status: 1,
    message: 'Product list from session',
    data: products
  });
};

// Delete product from session
const sessionProductDelete = (req, res) => {
  const param = req.params.id;
  const products = req.session.products || [];

  const filtered = products.filter(p => p._id !== param);
  req.session.products = filtered;

  req.session.save((err) => {
    if (err) {
      console.error(`Session save error for ${req.sessionID}:`, err);
      return res.status(500).json({
        status: 0,
        message: 'Error saving session'
      });
    }
    console.log(`Product deleted from session ${req.sessionID}:`, param);
    res.status(200).json({
      status: 1,
      message: 'Product deleted from session',
      data: req.session.products
    });
  });
};

module.exports = {
  sessionProductInsert,
  sessionProductList,
  sessionProductDelete
};