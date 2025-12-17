const express = require('express');
const router = express.Router();
const reagentController = require('../controllers/reagent.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');

router.get('/getAllReagents', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.getAllReagents);

router.get('/searchReagentsByName/:name', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.getReagentsByName);

router.post('/createReagent', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.createReagent);

router.put('/updateReagentByName/:name', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.updateReagentByName);

router.delete('/deleteReagentByName/:name', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.deleteReagentByName);

// Routes cho quản lý batch và hạn sử dụng
router.get('/getBatches/:name', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.getReagentBatches);

router.get('/getExpiring', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), reagentController.getExpiringReagents);

module.exports = router;