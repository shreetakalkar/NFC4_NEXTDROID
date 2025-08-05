// ai/summarise.js
"use client";
// import dotenv from "dotenv";
// dotenv.config();
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);


export default async function aiResponse(description) {
  console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `Evaluate this harassment report and return a JSON object with two fields: priority (Low/Medium/High) and score (0-100) based on severity.\n\n"${description}"` }],
        },
      ],
    });

    const responseText = await result.response.text();

    try {
      return JSON.parse(responseText);
    } catch {
      const priorityMatch = responseText.match(/priority\s*[:\-]?\s*(Low|Medium|High)/i);
      const scoreMatch = responseText.match(/score\s*[:\-]?\s*(\d{1,3})/i);

      if (priorityMatch && scoreMatch) {
        return {
          priority: priorityMatch[1],
          score: parseInt(scoreMatch[1]),
        };
      } else {
        throw new Error("Could not parse priority or score from AI response");
      }
    }
  } catch (error) {
    console.error("AI generation failed:", error);
    throw error;
  }
}
