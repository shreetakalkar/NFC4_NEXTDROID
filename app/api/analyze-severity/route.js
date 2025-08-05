// pages/api/analyze-severity.js (or app/api/analyze-severity/route.js for App Router)
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getDefaultSeverity(description) {
  const text = description.toLowerCase();
  
  // High severity keywords
  const highSeverityKeywords = [
    'threat', 'violence', 'kill', 'hurt', 'physical', 'assault', 
    'stalk', 'follow', 'attack', 'weapon', 'dangerous', 'scared',
    'fear', 'safety', 'police', 'emergency'
  ];
  
  // Medium severity keywords  
  const mediumSeverityKeywords = [
    'repeated', 'continue', 'persistent', 'multiple', 'again',
    'won\'t stop', 'keeps', 'harassment', 'inappropriate', 'uncomfortable'
  ];
  
  const hasHighKeywords = highSeverityKeywords.some(keyword => text.includes(keyword));
  const hasMediumKeywords = mediumSeverityKeywords.some(keyword => text.includes(keyword));
  
  if (hasHighKeywords) {
    return { priority: "High", score: 75 };
  } else if (hasMediumKeywords) {
    return { priority: "Medium", score: 50 };
  } else {
    return { priority: "Low", score: 25 };
  }
}

async function analyzeSeverity(description) {
  console.log("API Key present:", !!process.env.GEMINI_API_KEY);

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not defined in environment variables");
    return getDefaultSeverity(description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `You are a harassment severity analyzer. Analyze the following report and respond with ONLY a valid JSON object in this exact format:

{"priority": "Low", "score": 25}

Priority must be exactly one of: "Low", "Medium", "High"
Score must be a number between 0-100

Report to analyze: "${description}"

Criteria:
- Low (0-33): Minor issues, inappropriate comments, single incidents
- Medium (34-66): Repeated behavior, moderate impact, threats without violence
- High (67-100): Severe threats, physical harassment, stalking, safety concerns

Respond with ONLY the JSON object, no other text.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    console.log("Raw AI response:", responseText);

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(responseText);
      
      // Validate the structure
      if (parsed.priority && parsed.score !== undefined) {
        // Normalize priority capitalization
        const normalizedPriority = parsed.priority.charAt(0).toUpperCase() + 
                                 parsed.priority.slice(1).toLowerCase();
        
        // Validate priority values
        if (!['Low', 'Medium', 'High'].includes(normalizedPriority)) {
          throw new Error(`Invalid priority value: ${parsed.priority}`);
        }
        
        // Validate score
        const score = parseInt(parsed.score);
        if (isNaN(score) || score < 0 || score > 100) {
          throw new Error(`Invalid score value: ${parsed.score}`);
        }
        
        return {
          priority: normalizedPriority,
          score: score
        };
      }
    } catch (parseError) {
      console.log("JSON parse failed, trying fallback parsing...");
    }

    // Fallback parsing for non-JSON responses
    const cleanText = responseText.replace(/[{}"\n\r\t]/g, ' ');
    
    // More robust regex patterns
    const priorityMatch = cleanText.match(/priority\s*[:\-=]?\s*(low|medium|high)/i) ||
                         cleanText.match(/(low|medium|high)\s*priority/i) ||
                         cleanText.match(/\b(low|medium|high)\b/i);
    
    const scoreMatch = cleanText.match(/score\s*[:\-=]?\s*(\d{1,3})/i) ||
                      cleanText.match(/(\d{1,3})\s*\/?\s*100/i) ||
                      cleanText.match(/\b(\d{1,3})\b/);

    if (priorityMatch && scoreMatch) {
      const priority = priorityMatch[1].charAt(0).toUpperCase() + 
                      priorityMatch[1].slice(1).toLowerCase();
      const score = parseInt(scoreMatch[1]);
      
      // Final validation
      if (['Low', 'Medium', 'High'].includes(priority) && 
          !isNaN(score) && score >= 0 && score <= 100) {
        return { priority, score };
      }
    }

    // If all parsing fails, return a default based on keywords
    console.warn("Could not parse AI response, using keyword-based fallback");
    return getDefaultSeverity(description);
    
  } catch (error) {
    console.error("AI generation failed:", error);
    // Return default severity instead of throwing
    return getDefaultSeverity(description);
  }
}

// For Pages Router (pages/api/analyze-severity.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required and must be a string' });
  }

  try {
    const result = await analyzeSeverity(description);
    res.status(200).json(result);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// For App Router (app/api/analyze-severity/route.js)
export async function POST(request) {
  try {
    const { description } = await request.json();

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required and must be a string' }, { status: 400 });
    }

    const result = await analyzeSeverity(description);
    return Response.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}