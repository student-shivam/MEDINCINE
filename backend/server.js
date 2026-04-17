const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');


// Load env no matter the cwd (backend/.env)
dotenv.config({ path: path.join(__dirname, '.env') });


const authRoutes = require('./routes/authRoutes');
const medicineRoutes = require('./routes/medicineRoutes');
const saleRoutes = require('./routes/saleRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const subCategoryRoutes = require('./routes/subCategoryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const socket = require('./utils/socket');
const startNotificationCron = require('./utils/cronJobs');

const app = express();
const uploadsDir = path.join(__dirname, 'uploads');
const corsOrigins = (process.env.CLIENT_URL || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));


app.use(express.json());
app.use(cors({
    origin(origin, callback) {
        if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
}));
app.use(helmet({
    // Allow frontend app (different origin/port) to load uploaded images from /uploads
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(morgan('dev'));


const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});
app.use(limiter);


app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/notifications', notificationRoutes);


app.use(errorHandler);


app.get('/', (req, res) => {
    res.send('Medicine Inventory API is running...');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString(),
    });
});


const server = http.createServer(app);
socket.init(server);

const PORT = process.env.PORT || 5000;

// ensure required environment variables are present before starting
const startServer = async () => {
    if (!process.env.MONGO_URI) {
        console.warn('MONGO_URI not defined; the server will attempt to connect to a local MongoDB instance.');
    }

    if (!process.env.JWT_SECRET) {
        if (process.env.NODE_ENV === 'development') {
            console.warn('JWT_SECRET not defined; using a weak default secret for development only.');
            process.env.JWT_SECRET = 'devsecret';
        } else {
            console.error('JWT_SECRET is required in production environments. Set it in your .env file.');
            process.exit(1);
        }
    }

    try {
        await connectDB();

        // ensure there is at least one administrative user so developers
        // can log in right away. This will not overwrite an existing admin.
        const User = require('./models/User');
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            await User.create({
                name: 'Default Admin',
                email: 'admin@example.com',
                password: 'admin123@',
                role: 'admin',
            });
            console.log('👤 Default admin account created: admin@example.com / admin123@');
        }

        startNotificationCron();

        server.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });
    } catch (err) {
        console.error('Startup failed:', err.message);
        process.exit(1);
    }
};

startServer();

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);

    server.close(() => {
        process.exit(1);
    });
});
