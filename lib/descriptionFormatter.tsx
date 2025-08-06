import React from "react";

export const formatSectionContent = (content: string): React.ReactNode | null => {
  if (!content?.trim()) return null;

  // Handle nested ** formatting within sections
  const parts = content.split(/(\*\*.*?\*\*)/g);
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part.match(/^\*\*(.*?)\*\*$/)) {
      // Bold subsection
      const boldText = part
        .replace(/^\*\*(.*?)\*\*$/, "$1")
        .replace(/[:]*$/, "")
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
      // Regular text
      const cleanText = part.replace(/\s+/g, " ").trim();
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

export const formatDescription = (description: string): React.ReactNode => {
  if (!description) return "No description provided.";

  const elements: React.ReactNode[] = [];
  let elementKey = 0;

  // Check if it contains the user/AI format
  const hasUserAIFormat =
    description.includes("--- USER'S INITIAL DESCRIPTION ---") ||
    description.includes("--- AI-GENERATED SUMMARY ---");

  if (hasUserAIFormat) {
    // Handle USER/AI format
    const sections = description.split(/--- (.*?) ---/);

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
        // Section content
        const formattedContent = formatSectionContent(section);
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
    // Split by both ** and ### patterns
    const parts = description.split(/(\*\*.*?\*\*|###\s*.*?)(?=\n|$)/g);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]?.trim();
      if (!part) continue;

      if (part.match(/^\*\*(.*?)\*\*$/) || part.match(/^###\s*(.*?)$/)) {
        // Header section
        const headerText = part
          .replace(/^\*\*(.*?)\*\*$/, "$1")
          .replace(/^###\s*(.*?)$/, "$1")
          .replace(/[:]*$/, "")
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