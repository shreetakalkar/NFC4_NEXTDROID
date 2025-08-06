// pages/api/analyze-severity.js (or app/api/analyze-severity/route.js for App Router)
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// In-memory case collection (for demonstration; consider a database in production)
let caseCollection = [
  {
    case: "A coworker made a single inappropriate joke about my appearance.",
    priority: "Low",
    score: 20,
    explanation: "This case involves a single inappropriate comment with no indication of repeated behavior or threats, fitting the Low severity criteria (0-33) for minor issues. The incident has minimal impact and does not escalate to harassment or safety concerns. It aligns with the Low priority due to its isolated nature, similar to other one-off inappropriate remarks."
  },
  {
    case: "Someone sent me multiple unwanted messages over a week, making me uncomfortable.",
    priority: "Medium",
    score: 50,
    explanation: "The report describes repeated unwanted messages over a week, causing discomfort, which aligns with the Medium severity criteria (34-66) due to persistent behavior with moderate impact. Unlike High severity cases, there are no explicit threats or safety concerns, but the repetition escalates it beyond a single incident. This case is comparable to other instances of ongoing, non-threatening harassment."
  },
  {
    case: "I received a message threatening physical harm if I didn't comply with demands.",
    priority: "High",
    score: 80,
    explanation: "This case involves an explicit threat of physical harm, clearly fitting the High severity criteria (67-100) due to its direct impact on safety. The threatening nature of the message indicates a significant risk, warranting immediate attention. It aligns with other High severity cases involving explicit threats or potential violence."
  },
  {
    case: "A person followed me home after work and waited outside my house.",
    priority: "High",
    score: 90,
    explanation: "The reported stalking behavior, involving following someone home and lingering outside their residence, meets the High severity criteria (67-100) due to significant safety concerns. This case indicates a clear threat to personal safety, similar to other stalking-related incidents. The high score reflects the potential for escalation and immediate risk to the individual."
  },
  {
    case: "Repeatedly receiving offensive comments about my work in group chats.",
    priority: "Medium",
    score: 45,
    explanation: "This case involves repeated offensive comments in a group setting, fitting the Medium severity criteria (34-66) due to its persistent nature and moderate emotional impact. While not involving physical threats or safety concerns, the ongoing behavior creates a hostile environment, distinguishing it from Low severity single incidents. It is comparable to other cases of repeated, non-threatening harassment."
  }
];

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
    return { priority: 'High', score: 75, explanation: 'Fallback: High severity due to presence of critical keywords indicating potential danger or safety concerns.' };
  } else if (hasMediumKeywords) {
    return { priority: 'Medium', score: 50, explanation: 'Fallback: Medium severity due to repeated or inappropriate behavior without explicit threats.' };
  } else {
    return { priority: 'Low', score: 25, explanation: 'Fallback: Low severity due to lack of repeated behavior or serious threats.' };
  }
}

async function analyzeSeverity(description, attachmentImage = []) {
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not defined in environment variables');
    return getDefaultSeverity(description);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt1 = `You are a harassment severity analyzer. Analyze the following report and respond with ONLY a valid JSON object in this exact format:

{"priority": "Low", "score": 25}

Priority must be exactly one of: "Low", "Medium", "High"
Score must be a number between 0-100

Report to analyze: "${description}"
${attachmentImage.length > 0 ? `Additional context: The report includes an image attachment, which may contain relevant visual evidence (e.g., threatening content, inappropriate imagery).` : ''}

Criteria:
- Low (0-33): Minor issues, inappropriate comments, single incidents
- Medium (34-66): Repeated behavior, moderate impact, threats without violence
- High (67-100): Severe threats, physical harassment, stalking, safety concerns

Respond with ONLY the JSON object, no other text.`;

    const prompt2 = `You are a harassment severity analyzer. Analyze the following report and provide a detailed explanation of its severity. Respond with a paragraph (3-5 sentences) explaining why the report is assigned a specific priority and score, referencing relevant criteria and comparing it to similar cases from the provided collection.

Report to analyze: "${description}"
${attachmentImage.length > 0 ? `Additional context: The report includes an image attachment, which may contain relevant visual evidence (e.g., threatening content, inappropriate imagery). Assume the image supports the description unless otherwise specified.` : ''}

Severity Criteria:
- Low (0-33): Minor issues, inappropriate comments, single incidents
- Medium (34-66): Repeated behavior, moderate impact, threats without violence
- High (67-100): Severe threats, physical harassment, stalking, safety concerns

Case Collection:
${caseCollection.map((c, index) => `
${index + 1}. Case: "${c.case}"
   - Priority: ${c.priority}, Score: ${c.score}
   - Explanation: ${c.explanation}`).join('\n')}

Your response should explain the severity by comparing the report to these cases and justifying the assigned priority and score based on the criteria. Respond with only the paragraph, no JSON or other text.`;

    const result = await model.generateContent(prompt1);
    const responseText = result.response.text().trim();
    console.log('Raw AI response:', responseText);

    const result2 = await model.generateContent(prompt2);
    const responseText2 = result2.response.text().trim();
    console.log('Detailed AI response:', responseText2);

    // Try to parse JSON response from prompt1
    let parsedResult;
    try {
      const parsed = JSON.parse(responseText);
      
      if (parsed.priority && parsed.score !== undefined) {
        const normalizedPriority = parsed.priority.charAt(0).toUpperCase() + 
                                 parsed.priority.slice(1).toLowerCase();
        
        if (!['Low', 'Medium', 'High'].includes(normalizedPriority)) {
          throw new Error(`Invalid priority value: ${parsed.priority}`);
        }
        
        const score = parseInt(parsed.score);
        if (isNaN(score) || score < 0 || score > 100) {
          throw new Error(`Invalid score value: ${parsed.score}`);
        }
        
        parsedResult = {
          priority: normalizedPriority,
          score: score,
          explanation: responseText2
        };
      }
    } catch (parseError) {
      console.warn('JSON parse failed, trying fallback parsing:', parseError.message);
    }

    // Fallback parsing for non-JSON responses
    if (!parsedResult) {
      const cleanText = responseText.replace(/[{}"\n\r\t]/g, ' ');
      
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
        
        if (['Low', 'Medium', 'High'].includes(priority) && 
            !isNaN(score) && score >= 0 && score <= 100) {
          parsedResult = {
            priority,
            score,
            explanation: responseText2
          };
        }
      }
    }

    // If parsing fails, use default severity
    if (!parsedResult) {
      console.warn('Could not parse AI response, using keyword-based fallback');
      parsedResult = {
        ...getDefaultSeverity(description),
        explanation: responseText2 || getDefaultSeverity(description).explanation
      };
    }

    // Update case collection with the new report (for demonstration; consider a database in production)
    if (parsedResult.priority && parsedResult.score && parsedResult.explanation) {
      caseCollection.push({
        case: description,
        priority: parsedResult.priority,
        score: parsedResult.score,
        explanation: parsedResult.explanation
      });
      // Limit case collection size (e.g., keep last 5 cases)
      if (caseCollection.length > 5) {
        caseCollection = caseCollection.slice(-5);
      }
    }

    return parsedResult;
    
  } catch (error) {
    console.error('AI generation failed:', error.message);
    return getDefaultSeverity(description);
  }
}

// For Pages Router (pages/api/analyze-severity.js)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description, attachmentImage } = req.body;

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ error: 'Description is required and must be a string' });
  }

  try {
    const result = await analyzeSeverity(description, attachmentImage || []);
    res.status(200).json({
      priority: result.priority,
      score: result.score,
      explanation: result.explanation
    });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// For App Router (app/api/analyze-severity/route.js)
export async function POST(request) {
  try {
    const { description, attachmentImage } = await request.json();

    if (!description || typeof description !== 'string') {
      return Response.json({ error: 'Description is required and must be a string' }, { status: 400 });
    }

    const result = await analyzeSeverity(description, attachmentImage || []);
    return Response.json({
      priority: result.priority,
      score: result.score,
      explanation: result.explanation
    });
  } catch (error) {
    console.error('API Error:', error.message);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}