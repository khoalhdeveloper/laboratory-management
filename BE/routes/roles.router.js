const express = require('express');
const { getRolePrivileges, updateRolePrivileges } = require('../controllers/roles.controller');

const router = express.Router();

// Get role privileges by code
router.get('/get-roles/:roleCode', getRolePrivileges);

// Update role privileges by code
router.put('/update-roles/:roleCode', updateRolePrivileges);

module.exports = router;