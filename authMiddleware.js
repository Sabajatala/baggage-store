const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log('Authorization Header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 0, message: 'No token provided or invalid format' });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token:', token);

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        req.user = decoded;

        // Verify session
        if (!req.session.user || req.session.user.id !== decoded.id) {
            return res.status(401).json({ status: 0, message: 'Session invalid or expired' });
        }

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ status: 0, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;