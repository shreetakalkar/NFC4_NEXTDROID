import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
console.log(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export default async function aiResponse(prompt) {
  try {
    // Get the model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: `You are a Harassment Evaluation AI designed to assess textual descriptions of workplace or public harassment incidents. Your task is to determine the seriousness of the reported incident and return a JSON object with two fields:

1. "severity" — a string representing the severity level. It must be one of the following values: "low", "medium", "high", or "urgent".
2. "score" — an integer from 0 to 100 quantifying the severity.

Follow these guidelines when evaluating:

- Consider the nature of harassment (verbal, physical, cyber, sexual, emotional, etc.).
- Analyze power dynamics (e.g., authority abuse or threats from senior individuals).
- Check for frequency, recurrence, or escalation of the incident.
- Assess the emotional, mental, or physical impact on the victim.
- Evaluate presence of threats, coercion, or retaliation.
- Consider if any legal boundaries have been crossed.

Severity classification based on score:
- 0–25 → "low"
- 26–50 → "medium"
- 51–75 → "high"
- 76–100 → "urgent"

Output must be a strict JSON object with the following format:
{
  "severity": "high",
  "score": 67
}
Do not include explanations or formatting backticks, just return the JSON response.`
    });

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log(text);
    
    // Try to parse as JSON to validate the response
    try {
      const jsonResponse = JSON.parse(text);
      return jsonResponse;
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Return the raw text if JSON parsing fails
      return text;
    }
    
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw error;
  }
}

// Test the function
aiResponse("The manager repeatedly made unwelcome sexual comments towards the intern despite her objections, and threatened to fire her if she reported it.")
  .then(result => console.log("AI Response:", result))
  .catch(error => console.error("Error:", error));