const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blog.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');

// Public routes - không cần authentication
router.get('/public', blogController.getPublicBlogs); // Lấy 6 bài mới nhất cho hiển thị công khai
router.get('/news', blogController.getNewsFromAPI); // Lấy tin tức từ NewsAPI

// Admin routes - cần authentication và role admin  
router.get('/admin', verifyToken, checkSessionTimeout, authorizeRole('admin'), blogController.getAllBlogs); // Xem tất cả bài viết


module.exports = router;