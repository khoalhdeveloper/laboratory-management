const TestResultModel = require('../models/testResult.model');
const TestOrderModel = require('../models/testOrder.model');
const InstrumentModel = require('../models/intrusment.model');
const { pushNotification } = require('../helpers/notification.helper');
const emailSender = require('../helpers/email.sender');
const createTestResultEmailHTML = require('../public/test_result_email');

exports.createTestResult = async (req, res) => {
  try {
    const { order_code } = req.params;
    const {
      result_summary,
      result_details,
      // Blood Test parameters
      wbc_value,
      rbc_value,
      hgb_value,
      hct_value,
      plt_value,
      mcv_value,
      mch_value,
      mchc_value,

      // Urinalysis parameters
      leu_value,
      nit_value,
      pro_value,
      ph_value,
      bld_value,
      sg_value,
      ket_value,
      glu_value,
      // Fecal Analysis parameters
      fobt_value,
      wbcs_value,
      fecal_fat,
      O_and_P,
      rs_value,
      fc_value,
      color,
      // Common fields
      flag,
      status,
      instrument_id,
      instrument_name,
      test_type, // Add test_type from request body
    } = req.body;

   
    if (!result_summary) {
      return res.status(400).json({ message: 'result_summary is required' });
    }

    
    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    if (testOrder.status !== 'processing') {
      return res.status(400).json({ 
        message: 'Test order must be in "processing" status to create test result. Current status: ' + testOrder.status 
      });
    }

    const existingResult = await TestResultModel.findOne({ 
      $or: [
        { test_order_id: testOrder._id },
        { order_code: order_code }
      ]
    });
    
    if (existingResult) {
    
      await TestResultModel.findByIdAndDelete(existingResult._id);
    }

   
    
    const doctorId = req.user?.userid;
    const doctorName = req.user?.fullName;

    if (!doctorId || !doctorName) {
      return res.status(401).json({ 
        message: 'User information not found in token. Please login again.'
      });
    }

    
    let finalInstrumentId = instrument_id;
    let finalInstrumentName = instrument_name;
    
    if (finalInstrumentId) {
      const instrument = await InstrumentModel.findOne({ 
        instrument_id: finalInstrumentId  
      });
      
      if (instrument) {
        finalInstrumentName = instrument.name;
      } else {
        return res.status(404).json({ 
          message: 'Instrument not found with ID: ' + finalInstrumentId 
        });
      }
    } else {
      return res.status(400).json({ 
        message: 'Instrument ID is required' 
      });
    }
   
    const newTestResult = new TestResultModel({
      test_order_id: testOrder._id,  
      order_code: order_code,       
      doctor_id: doctorId,
      doctor_name: doctorName,
      instrument_id: finalInstrumentId,
      instrument_name: finalInstrumentName,
      test_type: test_type || testOrder.test_type, // Use test_type from request body if provided
      result_summary,
      result_details,
      // Blood Test parameters
      wbc_value,
      rbc_value,
      hgb_value,
      hct_value,
      plt_value,
      mcv_value,
      mch_value,
      mchc_value,
      // Urinalysis parameters
      leu_value,
      nit_value,
      pro_value,
      ph_value,
      bld_value,
      sg_value,
      ket_value,
      glu_value,
      // Fecal Analysis parameters
      fobt_value,
      wbcs_value,
      fecal_fat,
      O_and_P,
      rs_value,
      fc_value,
      color,
      // Common fields
      flag,
      status: status || 'completed',
    });

   
    const result = await newTestResult.save();

    
    await TestOrderModel.findByIdAndUpdate(
      testOrder._id,
      { 
        status: 'completed',
      }
    );
    
  
    await pushNotification({
      userid: testOrder.userid,  
      title: 'Test Result Ready',
      message: `Test application ${order_code} has been completed. Please check the results.`,
      type: 'success',
      for: 'user'
    });
    

    try {
      const emailHTML = createTestResultEmailHTML(testOrder, result);
      const emailResult = await emailSender({
        email: testOrder.email,
        subject: `Test Resultt- ${testOrder.order_code}`,
        html: emailHTML
      });
      

    } catch (emailError) {
}    
    res.status(201).json({
      message: 'Test result created successfully',
      data: result,
      emailSent: true
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
// Send test result email to patient
// =========================================================
exports.sendTestResultEmail = async (req, res) => {
  try {
    const { order_code } = req.params;

    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const testResult = await TestResultModel.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    const emailHTML = createTestResultEmailHTML(testOrder, testResult);
    const emailResult = await emailSender({
      email: testOrder.email,
      subject: `Test Result - ${testOrder.order_code}`,
      html: emailHTML
    });

    res.status(200).json({
      message: 'Email sent successfully',
      emailResult: emailResult
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getTestResultByOrderCode = async (req, res) => {
  try {
    const { order_code } = req.params;

    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    
    const testResult = await TestResultModel.findOne({ order_code: order_code });

    if (!testResult) {
      return res.status(404).json({ message: 'No test result found for this test order' });
    }

    res.status(200).json({
      message: 'Get test result successfully',
      data: {
        testOrder: {
          order_code: testOrder.order_code,
          patient_name: testOrder.patient_name,
          userid: testOrder.userid,
          status: testOrder.status,
          test_type: testOrder.test_type,
          created_at: testOrder.created_at,
          date_of_birth: testOrder.date_of_birth,
          age: testOrder.age,
          gender: testOrder.gender,
          phone_number: testOrder.phone_number,
          
        },
        testResult: {
          result_summary: testResult.result_summary,
          result_details: testResult.result_details,
          // Blood Test parameters
          wbc_value: testResult.wbc_value,
          rbc_value: testResult.rbc_value,
          hgb_value: testResult.hgb_value,
          hct_value: testResult.hct_value,
          plt_value: testResult.plt_value,
          mcv_value: testResult.mcv_value,
          mch_value: testResult.mch_value,
          mchc_value: testResult.mchc_value,
          // Urinalysis parameters
          leu_value: testResult.leu_value,
          nit_value: testResult.nit_value,
          pro_value: testResult.pro_value,
          ph_value: testResult.ph_value,
          bld_value: testResult.bld_value,
          sg_value: testResult.sg_value,
          ket_value: testResult.ket_value,
          glu_value: testResult.glu_value,
          // Fecal Analysis parameters
          fobt_value: testResult.fobt_value,
          wbcs_value: testResult.wbcs_value,
          fecal_fat: testResult.fecal_fat,
          O_and_P: testResult.O_and_P,
          rs_value: testResult.rs_value,
          fc_value: testResult.fc_value,
          color: testResult.color,
          flag: testResult.flag,
          status: testResult.status,
          doctor_name: testResult.doctor_name,
          instrument_id: testResult.instrument_id,
          instrument_name: testResult.instrument_name,
          createdAt: testResult.createdAt,
          ai_description: testResult.ai_description || '',
          comments: testResult.comments
            ? testResult.comments.filter(c => c.is_final === true).map(c => c.content)
            : []

        }
      }
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
// Send test result email to patient
// =========================================================
exports.sendTestResultEmail = async (req, res) => {
  try {
    const { order_code } = req.params;

    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const testResult = await TestResultModel.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    const emailHTML = createTestResultEmailHTML(testOrder, testResult);
    const emailResult = await emailSender({
      email: testOrder.email,
      subject: `Test Result - ${testOrder.order_code}`,
      html: emailHTML
    });

    res.status(200).json({
      message: 'Email sent successfully',
      emailResult: emailResult
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get my test results (for user to view their own results)
// =========================================================
exports.getMyTestResults = async (req, res) => {
  try {
    const currentUserid = req.user?.userid || req.user?.userid;

    if (!currentUserid) {
      return res.status(401).json({ message: 'User not authenticated' });
    }


    const AccountModel = require('../models/account.model');
    const userAccount = await AccountModel.findOne({ userid: currentUserid });
    const currentUserEmail = userAccount?.email;

    let query;
    if (currentUserEmail) {
      query = {
        $or: [
          { userid: currentUserid },
          { email: { $regex: new RegExp(`^${currentUserEmail}$`, 'i') } }
        ]
      };
    } else {
      query = { userid: currentUserid };
    }
   
    const testOrders = await TestOrderModel.find(query)
      .sort({ createdAt: -1 });

    if (testOrders.length === 0) {
      return res.status(404).json({ 
        message: 'Test order not found for this user' 
      });
    }

   
    const orderCodes = testOrders.map(order => order.order_code);

    
    const testResults = await TestResultModel.find({ 
      order_code: { $in: orderCodes } 
    }).sort({ createdAt: -1 });

    if (testResults.length === 0) {
      return res.status(404).json({ 
        message: 'No test results found for this user' 
      });
    }

   
    const combinedData = testResults.map(result => {
      const relatedOrder = testOrders.find(order => order.order_code === result.order_code);
      return {
        testOrder: {
          order_code: relatedOrder.order_code,
          patient_name: relatedOrder.patient_name,
          userid: relatedOrder.userid,
          status: relatedOrder.status,
          test_type: relatedOrder.test_type,
          priority: relatedOrder.priority,
          createdAt: relatedOrder.createdAt,
          date_of_birth: relatedOrder.date_of_birth,
          age: relatedOrder.age,
          gender: relatedOrder.gender,
          phone_number: relatedOrder.phone_number,


        },
        testResult: {
          result_summary: result.result_summary,
          result_details: result.result_details,
          // Blood Test parameters
          wbc_value: result.wbc_value,
          rbc_value: result.rbc_value,
          hgb_value: result.hgb_value,
          hct_value: result.hct_value,
          plt_value: result.plt_value,
          mcv_value: result.mcv_value,
          mch_value: result.mch_value,
          mchc_value: result.mchc_value,
          // Urinalysis parameters
          leu_value: result.leu_value,
          nit_value: result.nit_value,
          pro_value: result.pro_value,
          ph_value: result.ph_value,
          bld_value: result.bld_value,
          sg_value: result.sg_value,
          ket_value: result.ket_value,
          glu_value: result.glu_value,
          // Fecal Analysis parameters
          fobt_value: result.fobt_value,
          wbcs_value: result.wbcs_value,
          fecal_fat: result.fecal_fat,
          O_and_P: result.O_and_P,
          rs_value: result.rs_value,
          fc_value: result.fc_value,
          color: result.color,
          flag: result.flag,
          status: result.status,
          doctor_name: result.doctor_name,
          instrument_id: result.instrument_id,
          instrument_name: result.instrument_name,
          createdAt: result.createdAt,
          ai_description: result.ai_description || '',
          comments: result.comments
            ? result.comments.filter(c => c.is_final === true).map(c => c.content)
            : []

        }
      };
    });

    res.status(200).json({
      message: 'Get test result successfully',
      data: combinedData,
      total: combinedData.length
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



// =========================================================
// Send test result email to patient
// =========================================================
exports.sendTestResultEmail = async (req, res) => {
  try {
    const { order_code } = req.params;

    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const testResult = await TestResultModel.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    const emailHTML = createTestResultEmailHTML(testOrder, testResult);
    const emailResult = await emailSender({
      email: testOrder.email,
      subject: `Kết quả xét nghiệm - ${testOrder.order_code}`,
      html: emailHTML
    });

    res.status(200).json({
      message: 'Email sent successfully',
      emailResult: emailResult
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get all test results (for doctor and nurse)
// =========================================================
exports.getAllTestResults = async (req, res) => {
  try {

   
    const testResults = await TestResultModel.find({})
      .sort({ createdAt: -1 });

    if (testResults.length === 0) {
      return res.status(404).json({ 
        message: 'No test results found in the system' 
      });
    }

    
    const orderCodes = testResults.map(result => result.order_code);

   
    const testOrders = await TestOrderModel.find({ 
      order_code: { $in: orderCodes } 
    });

   
    if (testOrders.length === 0) {
      return res.status(404).json({ 
        message: 'No test order found corresponding to test results' 
      });
    }

    
    const combinedData = testResults.map(result => {
      const relatedOrder = testOrders.find(order => order.order_code === result.order_code);
      return {
        testOrder: {
          order_code: relatedOrder?.order_code || 'N/A',
          patient_name: relatedOrder?.patient_name || 'N/A',
          userid: relatedOrder?.userid || 'N/A',
          status: relatedOrder?.status || 'N/A',
          date_of_birth: relatedOrder?.date_of_birth || 'N/A',
          age: relatedOrder?.age || 'N/A',
          gender: relatedOrder?.gender || 'N/A',
          test_type: relatedOrder?.test_type || 'N/A',
          priority: relatedOrder?.priority || 'Medium',
          createdAt: relatedOrder?.createdAt || result.createdAt,
          phone_number: relatedOrder?.phone_number || 'N/A',
          email: relatedOrder?.email || 'N/A',
          address: relatedOrder?.address || 'N/A',
          created_by: relatedOrder?.created_by || 'N/A',
          notes: relatedOrder?.notes || 'N/A'
        },
        testResult: {
          test_type: result.test_type,
          result_summary: result.result_summary,
          result_details: result.result_details,
          // Blood Test parameters
          wbc_value: result.wbc_value,
          rbc_value: result.rbc_value,
          hgb_value: result.hgb_value,
          hct_value: result.hct_value,
          plt_value: result.plt_value,
          mcv_value: result.mcv_value,
          mch_value: result.mch_value,
          mchc_value: result.mchc_value,
          // Kidney Function Test parameters
          bun_value: result.bun_value,
          cre_value: result.cre_value,
          na_value: result.na_value,
          k_value: result.k_value,
          ca_value: result.ca_value,
          ca2_value: result.ca2_value,
          po4_value: result.po4_value,
          hco3_value: result.hco3_value,
          // Urinalysis parameters
          leu_value: result.leu_value,
          nit_value: result.nit_value,
          pro_value: result.pro_value,
          ph_value: result.ph_value,
          bld_value: result.bld_value,
          sg_value: result.sg_value,
          ket_value: result.ket_value,
          glu_value: result.glu_value,
          // Fecal Analysis parameters
          fobt_value: result.fobt_value,
          wbcs_value: result.wbcs_value,
          fecal_fat: result.fecal_fat,
          O_and_P: result.O_and_P,
          rs_value: result.rs_value,
          fc_value: result.fc_value,
          color: result.color,
          // Common fields
          flag: result.flag,
          status: result.status,
          doctor_name: result.doctor_name,
          instrument_id: result.instrument_id,
          instrument_name: result.instrument_name,
          created_at: result.created_at,
          ai_description: result.ai_description,
          comments: result.comments
        }
      };
    });

    res.status(200).json({
      message: 'Get all test results successfully',
      data: combinedData,
      total: combinedData.length
    });
  } catch (err) {
   
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
// Send test result email to patient
// =========================================================
exports.sendTestResultEmail = async (req, res) => {
  try {
    const { order_code } = req.params;

    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const testResult = await TestResultModel.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    const emailHTML = createTestResultEmailHTML(testOrder, testResult);
    const emailResult = await emailSender({
      email: testOrder.email,
      subject: `Kết quả xét nghiệm - ${testOrder.order_code}`,
      html: emailHTML
    });

    res.status(200).json({
      message: 'Email sent successfully',
      emailResult: emailResult
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
//  Get my performed test results (for doctor/nurse)
// =========================================================
exports.getMyPerformedTestResults = async (req, res) => {
  try {
    const currentUserId = req.user?.userid || req.user?.userId || req.user?.id || req.user?._id;
    const currentUserName = req.user?.fullName || req.user?.username;

    
    const testResults = await TestResultModel.find({ 
      doctor_id: currentUserId 
    }).sort({ createdAt: -1 });

    if (testResults.length === 0) {
      return res.status(404).json({ 
        message: 'No test results found that you have performed' 
      });
    }

    
    const orderCodes = testResults.map(result => result.order_code);

   
    const testOrders = await TestOrderModel.find({ 
      order_code: { $in: orderCodes } 
    });

    
    const combinedData = testResults.map(result => {
      const relatedOrder = testOrders.find(order => order.order_code === result.order_code);
      return {
        testOrder: {
          order_code: relatedOrder?.order_code || 'N/A',
          patient_name: relatedOrder?.patient_name || 'N/A',
          userid: relatedOrder?.userid || 'N/A',
          status: relatedOrder?.status || 'N/A',
          test_type: relatedOrder?.test_type || 'N/A',
          priority: relatedOrder?.priority || 'Medium',
          date_of_birth: relatedOrder?.date_of_birth || 'N/A',
          age: relatedOrder?.age || 'N/A',
          gender: relatedOrder?.gender || 'N/A',
          createdAt: relatedOrder?.createdAt || result.createdAt
        },
        testResult: {
          test_type: result.test_type,
          result_summary: result.result_summary,
          result_details: result.result_details,
          // Blood Test parameters
          wbc_value: result.wbc_value,
          rbc_value: result.rbc_value,
          hgb_value: result.hgb_value,
          hct_value: result.hct_value,
          plt_value: result.plt_value,
          mcv_value: result.mcv_value,
          mch_value: result.mch_value,
          mchc_value: result.mchc_value,
          // Kidney Function Test parameters
          bun_value: result.bun_value,
          cre_value: result.cre_value,
          na_value: result.na_value,
          k_value: result.k_value,
          ca_value: result.ca_value,
          ca2_value: result.ca2_value,
          po4_value: result.po4_value,
          hco3_value: result.hco3_value,
          // Urinalysis parameters
          leu_value: result.leu_value,
          nit_value: result.nit_value,
          pro_value: result.pro_value,
          ph_value: result.ph_value,
          bld_value: result.bld_value,
          sg_value: result.sg_value,
          ket_value: result.ket_value,
          glu_value: result.glu_value,
          // Fecal Analysis parameters
          fobt_value: result.fobt_value,
          wbcs_value: result.wbcs_value,
          fecal_fat: result.fecal_fat,
          O_and_P: result.O_and_P,
          rs_value: result.rs_value,
          fc_value: result.fc_value,
          color: result.color,
          // Common fields
          flag: result.flag,
          status: result.status,
          doctor_name: result.doctor_name,
          instrument_id: result.instrument_id,
          instrument_name: result.instrument_name,
          createdAt: result.createdAt
        }
      };
    });

    res.status(200).json({
      message: 'Get my performed test results successfully',
      data: combinedData,
      total: combinedData.length
    });
  } catch (err) {

    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// =========================================================
// Send test result email to patient
// =========================================================
exports.sendTestResultEmail = async (req, res) => {
  try {
    const { order_code } = req.params;

    const testOrder = await TestOrderModel.findOne({ order_code });
    if (!testOrder) {
      return res.status(404).json({ message: 'Test order not found' });
    }

    const testResult = await TestResultModel.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ message: 'Test result not found' });
    }

    const emailHTML = createTestResultEmailHTML(testOrder, testResult);
    const emailResult = await emailSender({
      email: testOrder.email,
      subject: `Kết quả xét nghiệm - ${testOrder.order_code}`,
      html: emailHTML
    });

    res.status(200).json({
      message: 'Email sent successfully',
      emailResult: emailResult
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

