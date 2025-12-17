const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const { GoogleGenerativeAI } = require("@google/generative-ai");

const knowledgeFiles = {
  "Blood Test": "blood.txt",
  "Urinalysis": "urinalysis.txt",
  "Fecal Analysis": "fecal.txt"
};


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });


async function readKnowledgeDocument(testType) {
  const fileName = knowledgeFiles[testType];
  if (!fileName) return null;

  const filePath = path.join(__dirname, "..", "knowledge", fileName);
  
  if (!fs.existsSync(filePath)) return null;

  const ext = path.extname(filePath).toLowerCase();
  
  try {
    if (ext === ".docx") {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    } else if (ext === ".txt" || ext === ".md") {
      return fs.readFileSync(filePath, "utf8");
    } else if (ext === ".pdf") {
    
      console.warn("PDF parsing is not supported in serverless environment");
      return null;
    }
  } catch (error) {
    console.error("Error reading document:", error.message);
    return null;
  }
  
  return null;
}

async function analyzeLabTest(testResult) {
  try {

    const knowledgeContent = await readKnowledgeDocument(testResult.test_type);
    
    if (!knowledgeContent) {
      console.log("Knowledge document not found, using fallback");
      return await generateBasicAnalysis(testResult);
    }

    const testParameters = Object.entries(testResult._doc || testResult)
      .filter(([k, v]) => k.endsWith("_value") && v !== undefined && v !== null)
      .map(([k, v]) => {
        const paramName = k.replace("_value", "").toUpperCase();
        return `${paramName}: ${v}`;
      })
      .join("\n");

    
    const prompt = `You are a medical laboratory assistant. Analyze the following test results based on the provided knowledge document.

KNOWLEDGE DOCUMENT:
${knowledgeContent}

TEST TYPE: ${testResult.test_type}

TEST RESULTS:
${testParameters}

INSTRUCTIONS:
1. Compare each parameter with the normal ranges from the knowledge document
2. Identify any abnormal values (high or low)
3. For each abnormal value, refer to the "Clinical Significance" section in the knowledge document to explain what it means
4. Provide a brief 2-4 sentence medical interpretation focusing on clinical significance
5. If all values are normal, state that and provide brief clinical context
6. Keep response professional and concise
7. Do not repeat the numeric values in your analysis

Provide your analysis:`;

   
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    console.log("Gemini AI analysis completed successfully");
    return analysis;
    
  } catch (error) {
    console.error("Gemini AI Error:", error.message);
    
   
    return await generateBasicAnalysis(testResult);
  }
}

async function generateBasicAnalysis(testResult) {
  let knowledgeContent = "";
  
  try {
    
    knowledgeContent = await readKnowledgeDocument(testResult.test_type);
  } catch (error) {
    console.error("Error reading knowledge document:", error.message);
  }

  
  const testParameters = Object.entries(testResult._doc || testResult)
    .filter(([k, v]) => k.endsWith("_value") && v !== undefined && v !== null)
    .map(([k, v]) => {
      const paramName = k.replace("_value", "").toUpperCase();
      return `${paramName}: ${v}`;
    })
    .join("\n");

  
  let analysis = `${testResult.test_type} - Basic Analysis\n\n`;
  analysis += `Test Parameters:\n${testParameters}\n\n`;
  
  if (knowledgeContent) {
    analysis += `Knowledge Document:\n${knowledgeContent}\n\n`;
    analysis += `Please compare the test parameters above with the information from the knowledge document.\n`;
  } else {
    analysis += `Note: Knowledge document could not be loaded. Please refer to standard medical references.\n`;
  }
  
  analysis += `\nRecommendation: Consult with a physician for detailed interpretation and clinical correlation.\n`;
  analysis += `\nNote: This is a basic fallback analysis. AI-powered comprehensive analysis requires Gemini API access.`;

  return analysis;
}

module.exports = { analyzeLabTest };
