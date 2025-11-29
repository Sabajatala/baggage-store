const Checkout = require('../models/checkout');
const nodemailer = require('nodemailer');
const Audit = require('../models/audit');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const storeCheckout = async (req, res) => {
  console.log('Request body:', req.body);
  const { user, items } = req.body;

  // Validate user and items
  if (!user || !user._id || typeof user._id !== 'string' || user._id.trim() === '' ||
      !user.name || !user.email || !user.phone || !user.location ||
      !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      status: 0,
      message: 'User details (_id, name, email, phone, location) and at least one item are required, and _id must be a non-empty string'
    });
  }

  try {
    const checkout = new Checkout({
      user,
      items
    });

    await checkout.save();
    console.log(`Checkout saved for user ${user.email}:`, checkout);

    // Remove only the selected items from session
    const selectedIds = items.map(item => item._id);
    req.session.products = (req.session.products || []).filter(product => !selectedIds.includes(product._id));
    await req.session.save();

    // Prepare email content
    const orderDate = new Date(checkout.createdAt).toLocaleString();
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

    const emailHtml = `
      <h2>Thank You for Your Order, ${user.name}!</h2>
      <p>Your order was placed on ${orderDate}.</p>
      <h3>Order Summary</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="border: 1px solid #ddd; padding: 8px;">Item</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Image</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">
                <img src="${item.image}" alt="${item.name}" style="width: 100px; height: auto;" />
              </td>
              <td style="border: 1px solid #ddd; padding: 8px;">$${item.price.toFixed(2)}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity}</td>
              <td style="border: 1px solid #ddd; padding: 8px;">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <p><strong>Total Amount:</strong> $${totalAmount}</p>
      <p><strong>Shipping Address:</strong> ${user.location}</p>
      <p>Thank you for shopping with Baggage Online Store!</p>
    `;

    await transporter.sendMail({
      from: `"Baggage Online Store" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: 'Your Order Confirmation - Baggage Online Store',
      html: emailHtml
    });
    console.log(`Order summary email sent to ${user.email}`);

    res.status(200).json({
      status: 1,
      message: 'Checkout data saved successfully and order summary emailed',
      data: checkout
    });
  } catch (err) {
    console.error(`Error in checkout for ${req.sessionID}:`, err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        status: 0,
        message: 'Checkout validation failed',
        errors: Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {})
      });
    }
    res.status(500).json({
      status: 0,
      message: 'Error saving checkout data or sending email',
      error: err.message
    });
  }
};

const getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await Checkout.find();
    res.status(200).json(checkouts);
  } catch (err) {
    console.error('Error fetching checkouts:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const updateCheckoutStatus = async (req, res) => {
  try {
    console.log(`Attempting to update checkout with ID: ${req.params.id}`);
    const checkout = await Checkout.findById(req.params.id);
    if (!checkout) {
      console.log(`Checkout not found for ID: ${req.params.id}`);
      return res.status(404).json({ message: 'Checkout not found' });
    }

    if (!checkout.user || !checkout.user._id) {
      console.log(`Invalid checkout document: missing user._id for ID: ${req.params.id}`);
      return res.status(400).json({ message: 'Invalid checkout document: missing user._id' });
    }

    const newStatus = checkout.status === 'pending' ? 'delivered' : 'pending';
    await Checkout.findByIdAndUpdate(req.params.id, { status: newStatus }, { runValidators: false });

    const audit = new Audit({
      user: req.user?.email || 'admin',
      action: 'Checkout Status Updated',
      details: `Checkout ID: ${req.params.id}, New Status: ${newStatus}`
    });
    await audit.save();
    console.log(`Checkout ID: ${req.params.id} updated to status: ${newStatus}`);

    const emailHtml = `
      <h2>Order Status Update</h2>
      <p>Dear ${checkout.user.name},</p>
      <p>Your order (ID: ${req.params.id}) status has been updated to <strong>${newStatus}</strong>.</p>
      <p>Thank you for shopping with Baggage Online Store!</p>
    `;

    await transporter.sendMail({
      from: `"Baggage Online Store" <${process.env.EMAIL_USER}>`,
      to: checkout.user.email,
      subject: `Order Status Update - Baggage Online Store`,
      html: emailHtml
    });
    console.log(`Status update email sent to ${checkout.user.email}`);

    res.status(200).json({ message: 'Checkout status updated', status: newStatus });
  } catch (error) {
    console.error('Error updating checkout status:', error);
    if (error.name === 'CastError') {
      console.log(`Invalid checkout ID format: ${req.params.id}`);
      return res.status(400).json({ message: 'Invalid checkout ID' });
    }
    if (error.name === 'ValidationError') {
      console.log(`Validation error for checkout ID: ${req.params.id}`, error.errors);
      return res.status(400).json({ message: 'Checkout validation failed', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update checkout status', error: error.message });
  }
};

module.exports = { storeCheckout, getAllCheckouts, updateCheckoutStatus };