const TestResult = require("../models/testResult.model");
const { analyzeLabTest } = require("../agents/labAIAgent.js");

// ---------------------------
// Get AI description
// ---------------------------
const getAIDescription = async (req, res) => {
  try {
    const { order_code } = req.params;
    const userid = req.user?.userid || req.user?.username;

    const testResult = await TestResult.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ success: false, message: "Test result not found" });
    }

    if (req.user?.role !== "nurse" && testResult.doctor_id !== userid) {
      return res.status(403).json({ success: false, message: "Only nurses or the doctor can access AI reviews" });
    }

    return res.status(200).json({
      success: true,
      message: "AI description retrieved successfully",
      data: {
        order_code,
        test_type: testResult.test_type,
        ai_description: testResult.ai_description || null,
        has_ai_description: !!testResult.ai_description
      }
    });

  } catch (error) {
    console.error("Error getting AI description:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ---------------------------
// Update AI description (auto-generate if empty)
// ---------------------------
const updateAIDescription = async (req, res) => {
  try {
    const { order_code } = req.params;
    const { description } = req.body;
    const userid = req.user?.userid || req.user?.username;

    const testResult = await TestResult.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ success: false, message: "Test result not found" });
    }

    if (req.user?.role !== "nurse" && testResult.doctor_id !== userid) {
      return res.status(403).json({ success: false, message: "Only nurses or the doctor can access AI reviews" });
    }

    let aiDescription = description?.trim();
    if (!aiDescription) {
      
      aiDescription = await analyzeLabTest(testResult);
    }

    testResult.ai_description = aiDescription;
    testResult.updated_at = new Date();
    await testResult.save();

    return res.status(200).json({
      success: true,
      message: description ? "AI description updated successfully" : "AI description generated successfully",
      data: { order_code, ai_description: aiDescription }
    });

  } catch (error) {
    console.error("Error updating AI description:", error);
    return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
  }
};

// ---------------------------
// Analyze test result with AI Agent
// ---------------------------
const analyzeWithAI = async (req, res) => {
  try {
    const { order_code } = req.params;
    const userid = req.user?.userid || req.user?.username;

    const testResult = await TestResult.findOne({ order_code });
    if (!testResult) {
      return res.status(404).json({ success: false, message: "Test result not found" });
    }

    if (req.user?.role !== "nurse" && testResult.doctor_id !== userid) {
      return res.status(403).json({ success: false, message: "Only nurses or the doctor can analyze results" });
    }

    
    console.log("Running AI analysis for order_code:", order_code);
    const aiDescription = await analyzeLabTest(testResult);

  
    testResult.ai_description = aiDescription;
    testResult.updated_at = new Date();
    await testResult.save();

    return res.status(200).json({
      success: true,
      message: "AI analysis completed successfully",
      data: {
        order_code,
        test_type: testResult.test_type,
        ai_description: aiDescription
      }
    });

  } catch (error) {
    console.error("Error analyzing with AI:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

module.exports = {
  analyzeWithAI,
  getAIDescription,
  updateAIDescription
};
