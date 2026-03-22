const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const machineRoutes = require('./routes/machineRoutes');
const partRoutes = require('./routes/partRoutes');
const saleRoutes = require('./routes/saleRoutes');
const rentalRoutes = require('./routes/rentalRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const customerRoutes = require('./routes/customerRoutes');
const quotationRoutes = require('./routes/quotationRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
    'http://localhost:5173', // Local development
    'https://your-frontend-url.onrender.com' // Replace with your Render frontend URL later
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(null, true); // For now, keep it open if you're testing, or set to false for strictness
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(bodyParser.json());

// Global Diagnostic Route
app.get('/api/test-server', (req, res) => res.json({ message: 'Backend is reachable', time: new Date() }));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/quotations', quotationRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} `);
});
