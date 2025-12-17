const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware');


router.get('/get-roles/:roleCode', verifyToken, authorizeRole(['admin']), rolesController.getRolePrivileges);
router.put('/update-roles/:roleCode', verifyToken, authorizeRole(['admin']), rolesController.updateRolePrivileges);




module.exports = router;