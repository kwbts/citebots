/**
 * Fallback generator for when external APIs fail
 */
const logger = require('./logger');

/**
 * Generates fallback table of contents
 * @param {Object} params - Brief parameters
 * @returns {Array<Object>} - The fallback TOC
 */
function generateFallbackTOC(params) {
  const title = params.title;
  const keywords = params.keywords || ['content'];
  const keyword = keywords[0] || 'topic';

  return [
    {
      title: `1. Introduction to ${title}`,
      points: [
        "Define key terms and concepts related to the topic",
        "Explain why this topic is important for the target audience",
        "Outline what readers will learn from this content"
      ]
    },
    {
      title: `2. Current State of ${keyword} in Modern Marketing`,
      points: [
        "Overview of how the technology/approach is currently used",
        "Key challenges and limitations with current implementations",
        "Recent developments and emerging trends"
      ]
    },
    {
      title: `3. Key Components and Integration Points`,
      points: [
        "Essential elements required for successful implementation",
        "Integration with existing systems and workflows",
        "Technical considerations and requirements",
        "Evaluation criteria for selecting the right solutions"
      ]
    },
    {
      title: `4. Strategic Implementation Framework`,
      points: [
        "Step-by-step approach to planning and implementation",
        "Resource requirements and team structure",
        "Timeline considerations and phased approach",
        "Common pitfalls and how to avoid them"
      ]
    },
    {
      title: `5. Case Studies and Success Examples`,
      points: [
        "Real-world examples of successful implementations",
        "Metrics and outcomes achieved by industry leaders",
        "Lessons learned and key success factors"
      ]
    },
    {
      title: `6. Best Practices and Optimization Strategies`,
      points: [
        "Tactical recommendations for maximizing effectiveness",
        "Ongoing maintenance and improvement processes",
        "Performance measurement and analytics approaches"
      ]
    },
    {
      title: `7. Future Trends and Strategic Considerations`,
      points: [
        "Emerging technologies and approaches to watch",
        "How to future-proof your implementation",
        "Strategic roadmap for continued evolution"
      ]
    }
  ];
}

/**
 * Generates fallback research links
 * @param {Object} params - Brief parameters
 * @returns {Array<Object>} - The fallback research links
 */
function generateFallbackResearchLinks(params) {
  const keyword = params.keywords[0] || 'marketing technology';
  
  return [
    {
      title: `The State of ${keyword} in 2025`,
      url: "https://example.com/state-of-martech-2025",
      description: "Comprehensive industry report with latest statistics and trends",
      source_type: "research"
    },
    {
      title: "Integration Best Practices for Composable Architecture",
      url: "https://example.com/composable-integration-best-practices",
      description: "Detailed technical guide on integration approaches for modern marketing stacks",
      source_type: "industry"
    },
    {
      title: `${keyword} Implementation Framework`,
      url: "https://example.com/implementation-framework",
      description: "Step-by-step methodology for successful technology implementation",
      source_type: "industry"
    },
    {
      title: "ROI Analysis of Modern Marketing Technologies",
      url: "https://example.com/martech-roi-analysis",
      description: "Research-backed analysis of return on investment for various martech components",
      source_type: "research"
    },
    {
      title: `Case Study: ${keyword} Success at Enterprise Scale`,
      url: "https://example.com/enterprise-case-study",
      description: "Detailed case study showing implementation and results at Fortune 500 companies",
      source_type: "industry"
    }
  ];
}

module.exports = {
  generateFallbackTOC,
  generateFallbackResearchLinks
};