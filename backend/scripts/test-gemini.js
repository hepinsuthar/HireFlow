require("dotenv").config();
const { GoogleGenAI } = require("@google/genai");

async function testGemini() {
  console.log("Testing Google Gemini API connection...");
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in backend/.env");
    process.exit(1);
  }
  const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  console.log(`Using model: ${modelName}`);

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Respond in 1 sentence: What makes an applicant tracking system effective?",
    });

    console.log("Gemini API call succeeded!");
    console.log("Response text:", response?.text?.trim());
  } catch (err) {
    console.error("Gemini API call failed:", err.message);
    if (err.status) console.error("Status code:", err.status);
    process.exit(1);
  }
}

testGemini();
