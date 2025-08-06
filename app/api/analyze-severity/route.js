// app/api/analyze-severity/route.js (for App Router)
import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from '../../../lib/firebase-admin';

// Initialize GoogleGenerativeAI with environment variable
const genAI = process.env.NEXT_PUBLIC_GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY) : null;

async function makeAIRequest(model, prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result;
  } catch (error) {
    console.error('AI request failed:', error.message);
    throw error;
  }
}

function getDefaultSeverity(description) {
  const text = description.toLowerCase();
  
  const highSeverityKeywords = [
    'threat', 'violence', 'kill', 'hurt', 'physical', 'assault', 
    'stalk', 'follow', 'attack', 'weapon', 'dangerous', 'scared',
    'fear', 'safety', 'police', 'emergency'
  ];
  
  const mediumSeverityKeywords = [
    'repeated', 'continue', 'persistent', 'multiple', 'again',
    'won\'t stop', 'keeps', 'harassment', 'inappropriate', 'uncomfortable'
  ];
  
  const hasHighKeywords = highSeverityKeywords.some(keyword => text.includes(keyword));
  const hasMediumKeywords = mediumSeverityKeywords.some(keyword => text.includes(keyword));
  
  if (hasHighKeywords) {
    return { 
      priority: 'High', 
      score: 75, 
      explanation: 'Fallback: High severity due to presence of critical keywords indicating potential danger or safety concerns.' 
    };
  } else if (hasMediumKeywords) {
    return { 
      priority: 'Medium', 
      score: 50, 
      explanation: 'Fallback: Medium severity due to repeated or inappropriate behavior without explicit threats.' 
    };
  } else {
    return { 
      priority: 'Low', 
      score: 25, 
      explanation: 'Fallback: Low severity due to lack of repeated behavior or serious threats.' 
    };
  }
}

async function elaborateDescription(originalDescription) {
  if (!genAI || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.log("NEXT_PUBLIC_GEMINI_API_KEY not found, returning original description");
    return originalDescription;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const elaborationPrompt = `You are a professional case documentation assistant. Take the following brief harassment report description and expand it into a more detailed, professional description while maintaining accuracy and sensitivity.

Original description: "${originalDescription}"

Guidelines:
1. Expand the description into 2-4 complete, well-structured sentences
2. Maintain the original meaning and facts - do not add fictional details
3. Use professional, objective language appropriate for official documentation
4. Focus on factual details and observed behaviors
5. Maintain sensitivity to the victim's experience
6. If the original is very brief or unclear, work with what's provided and note the limited information available
7. Do not invent specific details not present in the original

Respond with ONLY the elaborated description, no other text or formatting.`;

    const result = await makeAIRequest(model, elaborationPrompt);
    const elaboratedText = result.response.text().trim();
    
    // Clean up any quotes or extra formatting
    return elaboratedText.replace(/^["']|["']$/g, '');
    
  } catch (error) {
    console.error("Description elaboration failed:", error.message);
    return originalDescription;
  }
}

async function generateExplanation(description, priority, score) {
  if (!genAI || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    return `This case has been classified as ${priority} severity with a score of ${score} based on content analysis.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const explanationPrompt = `You are a harassment severity analyzer. Provide a detailed explanation for why the following report has been assigned the given priority and score.

Report: "${description}"
Assigned Priority: ${priority}
Assigned Score: ${score}

Severity Criteria:
- Low (0-33): Minor issues, inappropriate comments, single incidents
- Medium (34-66): Repeated behavior, moderate impact, threats without violence
- High (67-100): Severe threats, physical harassment, stalking, safety concerns

Provide a professional, objective explanation (3-5 sentences) that justifies the assigned severity level based on the content and criteria. Focus on specific elements in the report that led to this classification.

Respond with ONLY the explanation paragraph, no other text or formatting.`;

    const result = await makeAIRequest(model, explanationPrompt);
    return result.response.text().trim();
    
  } catch (error) {
    console.error("Explanation generation failed:", error.message);
    return `This case has been classified as ${priority} severity with a score of ${score} based on content analysis.`;
  }
}

async function analyzeSeverity(description) {
  console.log("API Key present:", !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  console.log("genAI initialized:", !!genAI);
  console.log("Description received:", description);

  if (!genAI || !process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.error("NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables");
    return getDefaultSeverity(description);
  }

  try {
    // First, elaborate the description
    const elaboratedDescription = await elaborateDescription(description);
    console.log("Original description:", description);
    console.log("Elaborated description that will be updated:", elaboratedDescription);

    // Use gemini-1.5-flash for analysis
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a harassment severity analyzer. Analyze the following report and respond with ONLY a valid JSON object in this exact format:

{"priority": "Low", "score": 25}

Priority must be exactly one of: "Low", "Medium", "High"
Score must be a number between 0-100

Report to analyze: "${elaboratedDescription}"

Criteria:
- Low (0-33): Minor issues, inappropriate comments, single incidents
- Medium (34-66): Repeated behavior, moderate impact, threats without violence
- High (67-100): Severe threats, physical harassment, stalking, safety concerns

Respond with ONLY the JSON object, no other text, no markdown formatting, no backticks.`;

    const result = await makeAIRequest(model, prompt);
    const responseText = result.response.text().trim();
    
    console.log("Raw AI response:", responseText);

    // Clean markdown formatting from response
    const cleanedResponse = responseText.replace(/```json\s*|\s*```/g, '').trim();
    console.log("Cleaned AI response:", cleanedResponse);

    let priority, score;

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(cleanedResponse);
      
      if (parsed.priority && parsed.score !== undefined) {
        const normalizedPriority = parsed.priority.charAt(0).toUpperCase() + 
                                 parsed.priority.slice(1).toLowerCase();
        
        if (!['Low', 'Medium', 'High'].includes(normalizedPriority)) {
          throw new Error(`Invalid priority value: ${parsed.priority}`);
        }
        
        const parsedScore = parseInt(parsed.score);
        if (isNaN(parsedScore) || parsedScore < 0 || parsedScore > 100) {
          throw new Error(`Invalid score value: ${parsed.score}`);
        }
        
        priority = normalizedPriority;
        score = parsedScore;
      }
    } catch (parseError) {
      console.log("JSON parse failed, trying fallback parsing...", parseError.message);
      
      // Fallback parsing for non-JSON responses
      const cleanText = cleanedResponse.replace(/[{}"\n\r\t]/g, ' ');
      
      const priorityMatch = cleanText.match(/priority\s*[:\-=]?\s*(low|medium|high)/i) ||
                           cleanText.match(/(low|medium|high)\s*priority/i) ||
                           cleanText.match(/\b(low|medium|high)\b/i);
      
      const scoreMatch = cleanText.match(/score\s*[:\-=]?\s*(\d{1,3})/i) ||
                        cleanText.match(/(\d{1,3})\s*\/?\s*100/i) ||
                        cleanText.match(/\b(\d{1,3})\b/);

      if (priorityMatch && scoreMatch) {
        priority = priorityMatch[1].charAt(0).toUpperCase() + 
                  priorityMatch[1].slice(1).toLowerCase();
        score = parseInt(scoreMatch[1]);
        
        // Validate parsed values
        if (!['Low', 'Medium', 'High'].includes(priority) || 
            isNaN(score) || score < 0 || score > 100) {
          priority = null;
          score = null;
        }
      }
    }

    // If parsing fails, use default severity
    if (!priority || score === null || score === undefined) {
      console.warn("Could not parse AI response, using keyword-based fallback");
      const defaultResult = getDefaultSeverity(description);
      priority = defaultResult.priority;
      score = defaultResult.score;
    }

    // Generate explanation separately
    const explanation = await generateExplanation(elaboratedDescription, priority, score);

    return {
      priority,
      score,
      elaboratedDescription,
      originalDescription: description,
      explanation: explanation.replace(/^["']|["']$/g, '') // Clean up quotes
    };
    
  } catch (error) {
    console.error("AI generation failed:", error.message);
    
    const defaultResult = getDefaultSeverity(description);
    return {
      ...defaultResult,
      elaboratedDescription: description,
      originalDescription: description,
      fallbackUsed: true
    };
  }
}

// Named export for POST method (App Router requirement)
export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      description, 
      caseId, 
      caseIds,
      updateDatabase = false
    } = body;

    console.log("POST request received with body:", { description, caseId, caseIds, updateDatabase });

    if (!description || typeof description !== 'string') {
      return Response.json(
        { error: 'Description is required and must be a string' }, 
        { status: 400 }
      );
    }

    const result = await analyzeSeverity(description);
    
    // Handle database updates - only update description field in cases collection
    if (updateDatabase && db) {
      try {
        // Single document update
        if (caseId) {
          console.log("=== DATABASE UPDATE ===");
          console.log("Case ID:", caseId);
          console.log("Description that will be saved:", result.elaboratedDescription);
          console.log("Priority:", result.priority);
          console.log("Score:", result.score);
          console.log("========================");
          
          await db.collection('cases').doc(caseId).update({
            description: result.elaboratedDescription,
            priority: result.priority,
            severityScore: result.score,
            explanation: result.explanation,
            updatedAt: new Date()
          });
          
          console.log(`Successfully updated case ${caseId} in cases collection`);
          result.updated = true;
          result.updatedCount = 1;
        }
        // Batch update for multiple documents
        else if (caseIds && Array.isArray(caseIds) && caseIds.length > 0) {
          console.log("=== BATCH DATABASE UPDATE ===");
          console.log("Case IDs:", caseIds);
          console.log("Description that will be saved to all cases:", result.elaboratedDescription);
          console.log("Priority:", result.priority);
          console.log("Score:", result.score);
          console.log("==============================");
          
          const batch = db.batch();
          
          caseIds.forEach(id => {
            const docRef = db.collection('cases').doc(id);
            batch.update(docRef, {
              description: result.elaboratedDescription, // Only update description
            });
          });
          
          await batch.commit();
          
          console.log(`Successfully updated ${caseIds.length} cases in cases collection`);
          result.updated = true;
          result.updatedCount = caseIds.length;
          result.updatedIds = caseIds;
        }
        else {
          console.log("No caseId or caseIds provided, skipping database operation");
          result.updated = false;
          result.updatedCount = 0;
          result.updateError = "No caseId or caseIds provided for update";
        }
        
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        result.updated = false;
        result.updateError = dbError.message;
        result.updatedCount = 0;
      }
    } else {
      result.updated = false;
      result.updatedCount = 0;
      if (updateDatabase && !db) {
        result.updateError = "Database not configured";
      }
    }
    
    console.log("Analysis result:", result);
    
    return Response.json(result, { status: 200 });
    
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Internal server error', details: error.message }, 
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return Response.json({
    status: 'API is running',
    geminiConfigured: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    dbConfigured: !!db,
    timestamp: new Date().toISOString()
  });
}