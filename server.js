const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const authRoutes = require('./routes/authRoutes');
const auditRoutes = require('./routes/auditRoutes');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// CORS configuration
// CORS configuration – Allow Render + Netlify + localhost
const allowedOrigins = [
  'http://127.0.0.1:5501',
  'http://localhost:5501',
  'http://localhost:3000',
  'https://baggage-store-production.up.railway.app/',  // your backend
  // Don't worry – Netlify URL will be added automatically below
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    // Allow your future Netlify site (any domain ending with .netlify.app)
    if (origin.includes('netlify.app') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
}));


// const allowedOrigins = ['http://127.0.0.1:5501', 'http://localhost:5501'];
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization']
// }));

// Session configuration
app.use(session({
    store: new FileStore({
        path: './sessions',
        ttl: 36000,
        reapInterval: 3600
    }),
    secret: process.env.SESSION_SECRET || 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/audits', auditRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors'); 
// const categoryRoutes = require('./routes/categoryRoutes');
// const productRoutes = require('./routes/productRoutes');
// const sessionRoutes = require('./routes/sessionRoutes');
// const checkoutRoutes = require('./routes/checkoutRoutes');
// const authRoutes = require('./routes/authRoutes');
// const session = require('express-session');
// const FileStore = require('session-file-store')(session);
// require('dotenv').config();

// const app = express();
// app.use(express.json());

// // CORS configuration
// const allowedOrigins = ['http://127.0.0.1:5501', 'http://localhost:5501'];

// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       callback(null, origin); 
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true, 
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
//   allowedHeaders: ['Content-Type', 'Accept', 'X-Requested-With', 'Authorization'] 
// }));

// // Session configuration
// app.use(session({
//   store: new FileStore({
//     path: './sessions',
//     ttl: 36000, 
//     reapInterval: 3600 
//   }),
//   secret: 'mysecretkey',
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     maxAge: 3600000, 
//     sameSite: 'lax', 
//     secure: false 
//   }
// }));

// // Connect to MongoDB
// mongoose.connect(process.env.MONGO_URI)
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));

// // Routes
// app.use('/api/categories', categoryRoutes);
// app.use('/api/products', productRoutes);
// app.use('/api/session', sessionRoutes);
// app.use('/api/auth', authRoutes);
// app.use('/api/checkout', checkoutRoutes);


// // Port
// const PORT = process.env.PORT || 7000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));