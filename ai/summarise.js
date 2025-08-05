// ai/summarise.js - Updated client-side version
export default async function aiResponse(description) {
  try {
    const response = await fetch('/api/analyze-severity', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    // Validate the response structure
    if (result.priority && typeof result.score === 'number') {
      return result;
    } else {
      throw new Error('Invalid response structure from API');
    }
  } catch (error) {
    console.error('Failed to get AI response:', error);
    
    // Fallback to default severity
    return getDefaultSeverity(description);
  }
}

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