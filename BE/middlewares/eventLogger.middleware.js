const EventLog = require("../models/eventLog.model");

const eventPatterns = [
  { pattern: /createinstrument/i, method: "POST", id: "E_00001", msg: "Add new instrument" },
  { pattern: /register/i, method: "POST", id: "E_00002", msg: "Create new user" },
  { pattern: /update-account/i, method: "PUT", id: "E_00003", msg: "Your account has been updated." },
  { pattern: /change-password/i, method: "POST", id: "E_00004", msg: "Password has been changed." },
  { pattern: /update-my-account/i, method: "PUT", id: "E_00005", msg: "Account has been updated." },
  { pattern: /updateinstrument/i, method: "PUT", id: "E_00006", msg: "Instrument has been updated." },
  { pattern: /delete-account/i, method: "PUT", id: "E_00007", msg: "Account has been deleted." },
  { pattern: /deleteinstrument/i, method: "DELETE", id: "E_00008", msg: "Instrument has been deleted." },
  { pattern: /createReagent/i, method: "POST", id: "E_00009", msg: "Reagent has been created." },
  { pattern: /createSupplyRecord/i, method: "POST", id: "E_00010", msg: "Supply record has been created." },
  { pattern: /updateSupplyRecord/i, method: "PUT", id: "E_00011", msg: "Supply record has been updated." },
  { pattern: /deleteSupplyRecord/i, method: "DELETE", id: "E_00012", msg: "Supply record has been deleted." },
  { pattern: /use-for-instrument/i, method: "POST", id: "E_00013", msg: "Reagent has been used for instrument." },
  { pattern: /use/i, method: "POST", id: "E_00014", msg: "Reagent has been used." },
  { pattern: /record/i, method: "PUT", id: "E_00015", msg: "Test order has been created." },
  { pattern: /createVendor/i, method: "POST", id: "E_00016", msg: "Vendor has been created." },
  { pattern: /updateVendor/i, method: "PUT", id: "E_00017", msg: "Vendor has been updated." },
  { pattern: /deleteVendor/i, method: "DELETE", id: "E_00018", msg: "Vendor has been deleted." },
  { pattern: /updateReagentByName/i, method: "PUT", id: "E_00019", msg: "Reagent has been updated." },
  { pattern: /deleteReagentByName/i, method: "DELETE", id: "E_00020", msg: "Reagent has been deleted." },
  { pattern: /createTestResult/i, method: "POST", id: "E_00021", msg: "Test result has been created." },
  { pattern: /recordTestOrder/i, method: "POST", id: "E_00022", msg: "Test order has been created." },
  { pattern: /updateTestOrder/i, method: "PUT", id: "E_00023", msg: "Test order has been updated." },
  { pattern: /deleteTestOrder/i, method: "DELETE", id: "E_00024", msg: "Test order has been deleted." },
  { pattern: /updateTestOrderStatus/i, method: "PUT", id: "E_00025", msg: "Test order status has been updated." },
  { pattern: /updateConfig/i, method: "PUT", id: "E_00026", msg: "Config has been updated." },
  { pattern: /createShift/i, method: "POST", id: "E_00027", msg: "Shift has been created." },
  { pattern: /updateShift/i, method: "PUT", id: "E_00028", msg: "Shift has been updated." },
  { pattern: /cancelShift/i, method: "DELETE", id: "E_00029", msg: "Shift has been cancelled." },
  { pattern: /publishShift/i, method: "PUT", id: "E_00030", msg: "Shift has been published." },
];  

module.exports = (req, res, next) => {

  res.on("finish", async () => {
    try {
      
      if (res.statusCode < 200 || res.statusCode >= 300) return;

      const user = req.user || {};
      const matched = eventPatterns.find(
        (e) => e.method === req.method && e.pattern.test(req.originalUrl)
      );

      if (!matched) return;

    
      const targetUserid = req.params.userid || req.body.userid || '';
      const targetInfo = targetUserid ? ` Target: ${targetUserid}` : '';

      const message = `${matched.msg}${targetInfo} — by ${user.username || "New user"} (${user.role || "New user"})`;


      await EventLog.create({
        event_id: matched.id,
        message,
        performedBy: user.username,
        role: user.role,
      });

      
    } catch (err) {
      
    }
  });

  next();
};
