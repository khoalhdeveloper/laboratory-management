const express = require('express');
const router = express.Router();
const { analyzeWithAI, getAIDescription, updateAIDescription } = require('../controllers/aiAnalysis.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');


router.post(
  '/analyze/:order_code',
  verifyToken,
  checkSessionTimeout,
  authorizeRole(['nurse']),
  analyzeWithAI
);


router.get(
  '/description/:order_code',
  verifyToken,
  checkSessionTimeout,
  authorizeRole(['nurse']),
  getAIDescription
);


router.put(
  '/description/:order_code',
  verifyToken,
  checkSessionTimeout,
  authorizeRole(['nurse']),
  updateAIDescription
);

module.exports = router;
