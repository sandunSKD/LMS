import React from 'react';
import './SummaryFormatter.css';

/**
 * Component to render formatted summaries with sections and bullet points
 * Parses markdown-like formatting and converts to structured HTML
 */
const SummaryFormatter = ({ text }) => {
  // Parse the summary text into sections
  const parseSummary = (text) => {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Skip empty lines
      if (!trimmedLine) return;

      // Check if it's a section header (bold text with ** or ending with :)
      if (trimmedLine.match(/^\*{2}.*\*{2}:?$/) || trimmedLine.match(/^#{1,3}\s+/) || (trimmedLine.match(/^[A-Za-z\s]+:$/) && !trimmedLine.startsWith('•'))) {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }

        // Remove ** formatting and create new section
        const title = trimmedLine
          .replace(/\*{2}/g, '')
          .replace(/^#+\s+/, '')
          .trim();

        currentSection = {
          title,
          items: [],
        };
      } else if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
        // Bullet point
        if (!currentSection) {
          currentSection = {
            title: 'Key Points',
            items: [],
          };
        }
        const item = trimmedLine.replace(/^[•\-]\s*/, '').trim();
        if (item) {
          currentSection.items.push(item);
        }
      } else if (currentSection && trimmedLine) {
        // Regular text (treat as item if no items yet)
        if (currentSection.items.length === 0) {
          currentSection.items.push(trimmedLine);
        } else {
          // Append to last item if it looks like continuation
          currentSection.items[currentSection.items.length - 1] += ' ' + trimmedLine;
        }
      }
    });

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
  };

  const sections = parseSummary(text);

  if (sections.length === 0) {
    // Fallback if parsing fails
    return <div className="summary-formatter-fallback">{text}</div>;
  }

  return (
    <div className="summary-formatter">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="summary-section">
          {section.title && (
            <h4 className="summary-section-title">
              {section.title}
            </h4>
          )}
          <ul className="summary-items-list">
            {section.items.map((item, itemIndex) => (
              <li key={itemIndex} className="summary-item">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SummaryFormatter;
