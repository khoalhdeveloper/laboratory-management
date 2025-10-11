// app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { swaggerUi, swaggerSpec } = require('./swagger');

// Routers
const authRouter = require('./routes/auth.router');
const accountRouter = require('./routes/account.router');
const userRoutes = require('./routes/user.router');
const testOrderRoutes = require('./routes/testOrder.router');
const instrumentRouter = require('./routes/instrument.router');
const roleRouter = require('./routes/roles.router');
const reagentUsageRouter = require('./routes/reagentUsage.router');
// Khởi tạo app
const app = express();

// CORS Configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
})();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/admin/accounts', accountRouter);
app.use('/api/user', userRoutes);
app.use('/api/user/accounts', accountRouter);
app.use('/api/test-orders', testOrderRoutes);
app.use('/api/instruments', instrumentRouter);
app.use('/api/admin', roleRouter);
app.use('/api/reagent-usage', reagentUsageRouter);


// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Laboratory Management API is running!',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
  
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Xuất app cho Vercel
module.exports = app;
// Chạy local (node app.js)
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Laboratory Management API v1.0.0`);
  });
}
