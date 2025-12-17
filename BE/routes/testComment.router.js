const express = require('express');
const router = express.Router();
const testCommentController = require('../controllers/testComment.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');
const { checkSessionTimeout } = require('../middlewares/session.middleware');



router.get('/getCommentsByOrderCode/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['doctor','nurse']), testCommentController.getCommentsByOrderCode);

router.post('/addComment/:order_code', verifyToken, checkSessionTimeout, authorizeRole(['doctor','nurse']), testCommentController.addComment);

router.put('/updateComment/:comment_id', verifyToken, checkSessionTimeout, authorizeRole(['doctor','nurse']), testCommentController.updateComment);

router.put('/markFinalComment/:order_code/:comment_id', verifyToken, checkSessionTimeout, authorizeRole(['doctor','nurse']), testCommentController.markFinalComment);

router.delete('/deleteComment/:comment_id', verifyToken, checkSessionTimeout, authorizeRole(['doctor','nurse']), testCommentController.deleteComment);



module.exports = router;