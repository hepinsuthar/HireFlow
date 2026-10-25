const { GoogleGenAI } = require("@google/genai");
const AppError = require("../utils/AppError");

async function generateText(prompt) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
  
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = process.env.GEMINI_MODEL || process.env.AI_MODEL || "gemini-2.5-flash";
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.3
        }
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.error("Gemini Gen AI generation error:", err.message);
      throw new AppError(`Google Gemini API request failed: ${err.message}`, 502);
    }
  }

  const endpoint = process.env.AI_API_URL;
  if (endpoint && apiKey) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.AI_MODEL || undefined,
        messages: [
          { role: "system", content: "You are an ethical, structured recruitment assistant. Provide factual suggestions." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3
      }),
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new AppError(`AI provider request failed (${response.status}).`, 502);
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || data.output_text || data.text;
    if (content) return content;
  }

  throw new AppError("Google Gemini AI is unconfigured. Please configure GEMINI_API_KEY in backend/.env.", 503);
}

module.exports = { generateText };
