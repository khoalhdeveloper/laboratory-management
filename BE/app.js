require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { swaggerUi, swaggerSpec } = require('./swagger');
const authRouter = require('./routes/auth.router');
const accountRouter = require('./routes/account.router');
const userRoutes = require('./routes/user.router');
const testOrderRoutes = require('./routes/testOrder.router');
const instrumentRouter = require('./routes/instrument.router');
const roleRouter = require('./routes/roles.router');
const reagentSupplyRouter = require('./routes/reagentSupply.router');
const reagentUsageRouter = require('./routes/reagentUsage.router');
const reagentRouter = require('./routes/reagent.router');
const vendorRouter = require('./routes/vendor.router');
const testResultRoutes = require('./routes/testResult.router');
const testCommentRouter = require('./routes/testComment.router');
const aiReviewRouter = require('./routes/aiReview.router');
const reagentUsage = require('./routes/reagentUsage.router');
const globalEventLogger = require("./middlewares/eventLogger.middleware");
const eventLogRouter = require('./routes/eventLog.router');
const settingsrouter = require('./routes/setting.routes');
const notificationRouter = require('./routes/notification.router');
const blogRouter = require('./routes/blog.router');
const roomRouter = require('./routes/room.router');
const shiftRouter = require('./routes/shift.router');
const consultationRouter = require("./routes/consultation.router");
const chatRoutes = require("./routes/chat.routers");
const groupCallRouter = require("./routes/groupCall.router");
const { not } = require('joi');
const app = express();



const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5000',
  'https://laboratory-management-six.vercel.app',
  'https://laboratory-management-phi.vercel.app',
  'https://laboratoryfetest.vercel.app',
  'https://deloy-project.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
   
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


(async () => {
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
  }
})();


app.use(globalEventLogger);
app.use('/api/auth', authRouter);
app.use('/api/admin/accounts', accountRouter);
app.use('/api/user', userRoutes);
app.use('/api/user/accounts', accountRouter);
app.use('/api/test-orders', testOrderRoutes);
app.use('/api/instruments', instrumentRouter);
app.use('/api/admin', roleRouter);
app.use('/api/reagent-supply', reagentSupplyRouter);
app.use('/api/reagent-usage', reagentUsageRouter);
app.use('/api/reagents', reagentRouter);
app.use('/api/vendors', vendorRouter);
app.use('/api/test-results', testResultRoutes);
app.use('/api/test-comments', testCommentRouter);
app.use('/api/ai-reviews', aiReviewRouter);
app.use('/api/reagent-usage', reagentUsage);
app.use('/api/event-logs', eventLogRouter);
app.use('/api/settings', settingsrouter);
app.use('/api/messages', notificationRouter);
app.use('/api/blogs', blogRouter);
app.use('/api/rooms', roomRouter);

app.use('/api/shifts', shiftRouter);
app.use("/api/consultations", consultationRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/group-calls", groupCallRouter);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    tryItOutEnabled: true,
    requestInterceptor: (req) => {

      req.headers['Access-Control-Allow-Origin'] = '*';
      return req;
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));


app.get('/', (req, res) => {
   try {
    const mongoose = require('mongoose');
    const state = mongoose.connection.readyState;
    const status = ['disconnected', 'connected', 'connecting', 'disconnecting'][state];
    res.status(200).json({
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ status: 'error', error: error.message });
  }
});


app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});


app.use((req, res) => {
  res.status(404).json({ 
    message: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});


module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📘 Swagger docs at http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Laboratory Management API v1.0.0`);

  });
}
