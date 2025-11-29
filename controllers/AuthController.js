const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ status: 0, message: 'Email and password are required' });
            }

            // Check admin credentials
            if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                const token = jwt.sign({ id: 'admin', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '5h' });
                console.log('Admin Token Generated:', token);
                req.session.user = { id: 'admin', email, role: 'admin', name: 'Admin' };
                return res.json({
                    status: 1,
                    data: {
                        token,
                        user: { id: 'admin', email, role: 'admin', name: 'Admin', phone: '', address: '' },
                        redirect: '/admin.html'
                    }
                });
            }

            // Check user in database
            const user = await User.findOne({ email });
            if (!user || !(await bcrypt.compare(password, user.password))) {
                return res.status(401).json({ status: 0, message: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user._id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '5h' });
            console.log('User Token Generated:', token);
            req.session.user = { id: user._id, email: user.email, role: 'user', name: user.name };
            res.json({
                status: 1,
                data: {
                    token,
                    user: { id: user._id, name: user.name, email: user.email, role: 'user', phone: user.phone, address: user.address },
                    redirect: '/user-panel.html'
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ status: 0, message: 'Server error' });
        }
    },

    getProfile: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ status: 0, message: 'Session expired' });
            }

            if (req.session.user.role === 'admin') {
                return res.json({
                    status: 1,
                    data: { id: 'admin', email: process.env.ADMIN_EMAIL, role: 'admin', name: 'Admin', phone: '', address: '' }
                });
            }

            const user = await User.findById(req.session.user.id);
            if (!user) {
                return res.status(401).json({ status: 0, message: 'User not found' });
            }
            res.json({
                status: 1,
                data: { id: user._id, name: user.name, email: user.email, role: 'user', phone: user.phone, address: user.address }
            });
        } catch (error) {
            console.error('Profile error:', error);
            res.status(500).json({ status: 0, message: 'Server error' });
        }
    },

    updateProfile: async (req, res) => {
        try {
            if (!req.session.user) {
                return res.status(401).json({ status: 0, message: 'Session expired' });
            }

            if (req.session.user.role === 'admin') {
                return res.status(403).json({ status: 0, message: 'Admin profile cannot be updated' });
            }

            const { name, phone, address } = req.body;
            const user = await User.findByIdAndUpdate(
                req.session.user.id,
                { name, phone, address },
                { new: true }
            );
            if (!user) {
                return res.status(401).json({ status: 0, message: 'User not found' });
            }
            req.session.user = { id: user._id, email: user.email, role: 'user', name: user.name };
            res.json({
                status: 1,
                data: { id: user._id, name: user.name, email: user.email, role: 'user', phone: user.phone, address: user.address }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({ status: 0, message: 'Server error' });
        }
    },

    logout: (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error('Logout error:', err);
                return res.status(500).json({ status: 0, message: 'Failed to logout' });
            }
            res.json({ status: 1, message: 'Logged out successfully' });
        });
    }
};

module.exports = authController;