const express = require("express");
const router = express.Router();
const { useReagents, useReagentsForInstrument, getReagentUsageHistory, getReagentUsageByUsedFor, getReagentUsageByInstrument } = require("../controllers/reagentUsage.controller");
const { verifyToken, authorizeRole } = require("../middlewares/auth.middleware");
const { checkSessionTimeout } = require("../middlewares/session.middleware");




router.post("/use", verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), useReagents);

router.post("/use-for-instrument", verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), useReagentsForInstrument);

router.get("/history", verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), getReagentUsageHistory);

router.get('/historyByUsedFor/:used_for', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), getReagentUsageByUsedFor);

router.get('/historyByInstrument/:instrument_id', verifyToken, checkSessionTimeout, authorizeRole(['admin','doctor','nurse']), getReagentUsageByInstrument);



module.exports = router;
