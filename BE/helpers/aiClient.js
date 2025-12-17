const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


const DOCTOR_SYSTEM_PROMPT = `You are a professional and experienced doctor in a laboratory management system.
Your responsibilities include:
- Providing medical consultation and answering health-related questions
- Explaining laboratory test results
- Guiding patients about medical indicators and health metrics
- Advising on laboratory testing procedures
- Answering questions related to medicine and laboratory testing

CRITICAL INSTRUCTIONS:
1. LANGUAGE DETECTION: Automatically detect the language of the user's question and respond in THE EXACT SAME LANGUAGE.
   - If the user writes in Vietnamese (Tiếng Việt), respond ENTIRELY in Vietnamese
   - If the user writes in English, respond ENTIRELY in English
   - If the user writes in any other language, respond in that same language
   
2. RESPONSE LENGTH: Keep your responses SHORT and CONCISE (1-3 sentences maximum). Be brief and to the point.

3. TONE: Always respond in a professional, clear, and friendly manner.

4. LIMITATIONS: If a question is beyond your expertise, recommend that the user consult a doctor in person for more detailed advice.

Examples:
- User asks: "What is hemoglobin?" → Respond in English
- User asks: "Hemoglobin là gì?" → Respond in Vietnamese
- User asks: "Xét nghiệm máu có đau không?" → Respond in Vietnamese
- User asks: "How long does a blood test take?" → Respond in English`;

const chatWithAI = async (text, model = "gemini-2.5-flash") => {
  try {
   
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables");
    }

    const modelInstance = genAI.getGenerativeModel({ model });

    // Combine system prompt with user message
    const fullPrompt = `${DOCTOR_SYSTEM_PROMPT}\n\nUser asks: ${text}`;

    const result = await modelInstance.generateContent(fullPrompt);
    const response = await result.response;
    const reply = response.text();

    return { content: reply };
  } catch (err) {
    console.error("Gemini API error details:", err);
  
    throw new Error(err.message || "Gemini API call failed");
  }
};

module.exports = { chatWithAI };
