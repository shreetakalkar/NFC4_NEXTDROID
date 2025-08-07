import React from "react";

export const formatSectionContent = (content: string): React.ReactNode | null => {
  if (!content?.trim()) return null;

  // First, clean up asterisks more thoroughly
  const cleanedContent = content
    // Remove standalone asterisks that aren't part of markdown formatting
    .replace(/\*+(?!\w)/g, '') // Remove asterisks not followed by word characters
    .replace(/(?<!\w)\*+/g, '') // Remove asterisks not preceded by word characters
    // Handle nested ** formatting within sections more carefully
    .replace(/\*{3,}/g, '**') // Convert multiple asterisks to double asterisks
    .trim();

  const parts = cleanedContent.split(/(\*\*.*?\*\*)/g);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part.match(/^\*\*(.*?)\*\*$/)) {
      // Bold subsection - clean up the text inside
      const boldText = part
        .replace(/^\*\*(.*?)\*\*$/, "$1")
        .replace(/[:]*$/, "")
        .replace(/\*+/g, '') // Remove any remaining asterisks
        .trim();
      if (boldText) {
        elements.push(
          <span
            key={i}
            className="font-medium text-gray-800 dark:text-gray-200 block mt-2 first:mt-0 text-sm"
          >
            {boldText}
          </span>
        );
      }
    } else {
      // Regular text - clean up asterisks
      const cleanText = part
        .replace(/\*+/g, '') // Remove all remaining asterisks
        .replace(/\s+/g, " ")
        .trim();
      if (cleanText) {
        elements.push(
          <span
            key={i}
            className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed"
          >
            {cleanText}
          </span>
        );
      }
    }
  }

  return elements.length > 0 ? (
    <div className="space-y-1">{elements}</div>
  ) : null;
};

<<<<<<< Updated upstream
export const formatEvidenceAnalysis = (analysis: string): React.ReactNode => {
  if (!analysis?.trim()) return "No evidence analysis provided.";

  const elements: React.ReactNode[] = [];
  let elementKey = 0;

  // Split by asterisk patterns (*, **, ***) followed by content
  const parts = analysis.split(/(\*{1,3}\s*\*?\*?[^*]*?)(?=\s*\*{1,3}|$)/g);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]?.trim();
    if (!part) continue;

    // Check for different levels of asterisk formatting
    if (part.match(/^\*{3,}\s*\*?\*?(.*?):\s*(.*)/s)) {
      // Triple asterisk with colon (***Section:** content)
      const match = part.match(/^\*{3,}\s*\*?\*?(.*?):\s*(.*)/s);
      if (match) {
        const [, header, content] = match;
        
        elements.push(
          <div key={elementKey++} className="mt-4 first:mt-0">
            <div className="font-bold text-amber-700 dark:text-amber-300 text-sm mb-2 pb-1 border-b border-amber-200 dark:border-amber-700">
              {header.trim()}
            </div>
            <div className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed pl-3 border-l-2 border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20 p-2 rounded-r">
              {content.trim()}
            </div>
          </div>
        );
      }
    } else if (part.match(/^\*{2}\s*(.*?):\s*(.*)/s)) {
      // Double asterisk with colon (**Section:** content)
      const match = part.match(/^\*{2}\s*(.*?):\s*(.*)/s);
      if (match) {
        const [, header, content] = match;
        
        elements.push(
          <div key={elementKey++} className="mt-3 first:mt-0">
            <div className="font-semibold text-blue-700 dark:text-blue-300 text-sm mb-1 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              {header.trim()}:
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-4 bg-blue-50/30 dark:bg-blue-950/20 p-2 rounded border-l-2 border-blue-200 dark:border-blue-700">
              {content.trim()}
            </div>
          </div>
        );
      }
    } else if (part.match(/^\*\s*(.*?):\s*(.*)/s)) {
      // Single asterisk with colon (*Section:** content)
      const match = part.match(/^\*\s*(.*?):\s*(.*)/s);
      if (match) {
        const [, header, content] = match;
        
        elements.push(
          <div key={elementKey++} className="mt-2 first:mt-0">
            <div className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1 flex items-center">
              <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
              {header.trim()}:
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed pl-3 ml-2">
              {content.trim()}
            </div>
          </div>
        );
      }
    } else if (part.match(/^\*{1,3}/)) {
      // Handle asterisk patterns without colons
      const cleanContent = part.replace(/^\*{1,3}\s*/, "").trim();
      if (cleanContent) {
        // Determine styling based on asterisk count
        const asteriskCount = (part.match(/^\*+/) || [""])[0].length;
        let className = "";
        
        if (asteriskCount >= 3) {
          className = "font-bold text-red-700 dark:text-red-300 text-sm mt-3 first:mt-0 mb-2 p-2 bg-red-50/50 dark:bg-red-950/30 border-l-4 border-red-500 rounded-r";
        } else if (asteriskCount === 2) {
          className = "font-semibold text-blue-700 dark:text-blue-300 text-sm mt-2 first:mt-0 mb-1 p-1 bg-blue-50/30 dark:bg-blue-950/20 border-l-2 border-blue-400 rounded-r";
        } else {
          className = "font-medium text-gray-800 dark:text-gray-200 text-sm mt-1 first:mt-0 pl-2 border-l border-gray-300 dark:border-gray-600";
        }
        
        elements.push(
          <div key={elementKey++} className={className}>
            {cleanContent}
          </div>
        );
      }
    } else {
      // Regular content without asterisk formatting
      const cleanContent = part.replace(/\s+/g, " ").trim();
      if (cleanContent && !cleanContent.match(/^\*+$/)) {
        elements.push(
          <div key={elementKey++} className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mt-1 p-1">
            {cleanContent}
          </div>
        );
      }
    }
  }

  return elements.length > 0 ? (
    <div className="space-y-1">{elements}</div>
  ) : (
    "No evidence analysis provided."
  );
=======
// Enhanced function to clean text of asterisks and markdown artifacts
const cleanMarkdownArtifacts = (text: string): string => {
  return text
    // Remove asterisks used for emphasis (both single and double)
    .replace(/\*{1,3}([^*]*?)\*{1,3}/g, '$1')
    // Remove any remaining standalone asterisks
    .replace(/\*+/g, '')
    // Clean up underscores used for emphasis
    .replace(/_{1,3}([^_]*?)_{1,3}/g, '$1')
    // Remove backticks
    .replace(/`+([^`]*?)`+/g, '$1')
    // Clean up excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
>>>>>>> Stashed changes
};

export const formatDescription = (description: string): React.ReactNode => {
  if (!description) return "No description provided.";

  // Pre-clean the description to remove problematic asterisks
  const preCleanedDescription = cleanMarkdownArtifacts(description);
  
  const elements: React.ReactNode[] = [];
  let elementKey = 0;

  // Check if it contains the user/AI format
  const hasUserAIFormat =
    preCleanedDescription.includes("--- USER'S INITIAL DESCRIPTION ---") ||
    preCleanedDescription.includes("--- AI-GENERATED SUMMARY ---");

  if (hasUserAIFormat) {
    // Handle USER/AI format
    const sections = preCleanedDescription.split(/--- (.*?) ---/);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]?.trim();
      if (!section) continue;

      if (
        section.includes("USER'S INITIAL DESCRIPTION") ||
        section.includes("AI-GENERATED SUMMARY")
      ) {
        // Section header
        elements.push(
          <div
            key={elementKey++}
            className="font-bold text-blue-700 dark:text-blue-300 text-sm uppercase tracking-wide mt-3 first:mt-0 mb-1 border-b border-blue-200 dark:border-blue-700 pb-1"
          >
            {section.replace(/'/g, "'")}
          </div>
        );
      } else {
        // Section content - apply additional cleaning
        const cleanedSection = cleanMarkdownArtifacts(section);
        const formattedContent = formatSectionContent(cleanedSection);
        if (formattedContent) {
          elements.push(
            <div key={elementKey++} className="mb-3">
              {formattedContent}
            </div>
          );
        }
      }
    }
  } else {
    // Handle standard formats with ** or ### headers
    // More careful splitting to preserve content
    const parts = preCleanedDescription.split(/(\*\*.*?\*\*|###\s*.*?)(?=\n|$)/g);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]?.trim();
      if (!part) continue;

      if (part.match(/^\*\*(.*?)\*\*$/) || part.match(/^###\s*(.*?)$/)) {
        // Header section
        const headerText = part
          .replace(/^\*\*(.*?)\*\*$/, "$1")
          .replace(/^###\s*(.*?)$/, "$1")
          .replace(/[:]*$/, "")
          .replace(/\*+/g, '') // Remove any remaining asterisks
          .trim();

        if (headerText) {
          elements.push(
            <div
              key={elementKey++}
              className="font-semibold text-gray-900 dark:text-gray-100 mt-3 first:mt-0 mb-1 text-sm"
            >
              {headerText}
            </div>
          );
        }
      } else {
        // Regular content
        const cleanContent = part
          .replace(/^\*\*.*?\*\*\s*/g, "")
          .replace(/^###\s*.*?\s*/g, "")
          .replace(/\*+/g, '') // Remove all asterisks
          .replace(/\s+/g, " ")
          .trim();

        if (cleanContent) {
          elements.push(
            <div
              key={elementKey++}
              className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-2"
            >
              {cleanContent}
            </div>
          );
        }
      }
    }
  }

  return elements.length > 0 ? (
    <div className="space-y-1">{elements}</div>
  ) : (
    "No description provided."
  );
};

// Additional utility function for truncating formatted descriptions
export const truncateFormattedDescription = (
  description: string, 
  maxLength: number = 200
): React.ReactNode => {
  if (!description) return "No description provided.";

  // Convert to plain text for length checking
  const plainText = cleanMarkdownArtifacts(description);
  
  if (plainText.length <= maxLength) {
    return formatDescription(description);
  }

  // Truncate the plain text
  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength;
  const truncatedText = plainText.substring(0, cutPoint) + '...';

  return (
    <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
      {truncatedText}
    </div>
  );
};

// Simple text-only version for cases where React nodes aren't needed
export const formatDescriptionAsText = (description: string): string => {
  if (!description) return "No description provided.";
  
  return cleanMarkdownArtifacts(description)
    // Handle section headers
    .replace(/--- (.*?) ---/g, '\n$1:\n')
    .replace(/\*\*(.*?)\*\*/g, '$1:')
    .replace(/###\s*(.*?)$/gm, '$1:')
    // Clean up extra newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim() || "No description provided.";
};