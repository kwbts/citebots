#!/usr/bin/env node

/**
 * Citation Extraction Demo
 * 
 * Demonstrates citation extraction from different AI platforms
 * Shows how to handle various response formats and extract URLs
 */

import { 
  extractCitations,
  extractCitationsFromChatGPT,
  extractCitationsFromPerplexity,
  extractCitationsFromClaude,
  batchExtractCitations,
  validateCitations,
  deduplicateCitations
} from '../lib/citationExtractor.js';

/**
 * Example ChatGPT response formats
 */
const CHATGPT_EXAMPLES = {
  // Standard API response with content
  standard: {
    choices: [{
      message: {
        content: `Here are the best project management tools for teams:

1. **Monday.com** - Great for visual project tracking and team collaboration [1]
2. **Asana** - Excellent for task management and workflow automation [2]  
3. **Trello** - Simple kanban-style boards perfect for small teams [3]
4. **Basecamp** - All-in-one solution for project organization [4]

These tools offer different approaches to project management, with Monday.com [1] being particularly strong for visual learners, while Asana [2] excels in complex workflow management.

References:
[1] https://monday.com/features/project-management
[2] https://asana.com/product/project-management
[3] https://trello.com/tour
[4] https://basecamp.com/features`
      }
    }]
  },

  // Response with tool calls (web search)
  withToolCalls: {
    choices: [{
      message: {
        tool_calls: [
          {
            type: 'web_search',
            web_search: {
              urls: [
                'https://monday.com/project-management-software',
                'https://asana.com/uses/project-management',
                'https://trello.com/project-management'
              ]
            }
          }
        ],
        content: 'Based on current web research, here are the top project management tools...'
      }
    }]
  },

  // Simple text response
  plainText: `The most popular project management software options include:

• Monday.com (https://monday.com) - Visual project tracking
• Asana (https://asana.com) - Task and workflow management  
• Trello (https://trello.com) - Kanban-style project boards
• Jira (https://atlassian.com/software/jira) - Agile project management

Each platform offers unique features for different team sizes and project types.`
};

/**
 * Example Perplexity response formats
 */
const PERPLEXITY_EXAMPLES = {
  // API response with citations array
  withCitations: {
    choices: [{
      message: {
        content: 'The best project management software for 2024 includes several standout options...'
      }
    }],
    citations: [
      {
        url: 'https://www.capterra.com/project-management-software/',
        title: 'Best Project Management Software - Capterra'
      },
      {
        url: 'https://www.forbes.com/advisor/business/software/best-project-management-software/',
        title: 'Best Project Management Software For 2024 - Forbes'
      },
      'https://www.softwareadvice.com/project-management/' // Sometimes just URLs
    ]
  },

  // Standard content with embedded citations
  embedded: {
    choices: [{
      message: {
        content: `Project management software has become essential for modern teams. According to recent studies [1], over 77% of high-performing projects use project management software.

The top-rated solutions include:

1. **Monday.com** - Highly visual and customizable [2]
2. **Asana** - Great for task management [3]
3. **Trello** - Simple and intuitive [4]

[1] https://www.pmi.org/learning/library/project-management-software-study-9012
[2] https://monday.com/project-management-features
[3] https://asana.com/guide/project-management
[4] https://trello.com/guide/project-management`
      }
    }]
  }
};

/**
 * Example Claude response formats
 */
const CLAUDE_EXAMPLES = {
  // Anthropic API format
  anthropic: {
    content: [{
      type: 'text',
      text: `I'd be happy to help you find the best project management software. Here are some top options:

**Monday.com** (https://monday.com) - Excellent visual interface with customizable workflows
**Asana** (https://asana.com) - Great for teams that need detailed task management
**Trello** (https://trello.com) - Perfect for simple, visual project organization

For more detailed comparisons, you might want to check:
- Capterra's comparison guide: https://www.capterra.com/project-management-software/
- G2's user reviews: https://www.g2.com/categories/project-management

Each tool has its strengths, so the best choice depends on your team size and workflow preferences.`
    }]
  },

  // Simple text format
  simple: `Based on current market analysis, here are the leading project management platforms:

1. **Monday.com** - Visual project tracking with excellent team collaboration features
   📎 Learn more: https://monday.com/features

2. **Asana** - Comprehensive task management with powerful automation
   📎 Product overview: https://asana.com/product

3. **Notion** - All-in-one workspace combining docs, databases, and project management
   📎 Project templates: https://www.notion.so/templates/category/project-management

These platforms each offer free tiers, making them accessible for teams of all sizes.`
};

/**
 * Demonstrate citation extraction from different platforms
 */
async function runCitationDemo() {
  console.log('🔗 CITATION EXTRACTION DEMO');
  console.log('='.repeat(50));

  // ChatGPT Examples
  console.log('\n🤖 CHATGPT CITATION EXTRACTION');
  console.log('-'.repeat(30));

  console.log('\n📝 Example 1: Standard API Response');
  const chatGptStandard = extractCitationsFromChatGPT(CHATGPT_EXAMPLES.standard);
  displayCitations(chatGptStandard, 'ChatGPT Standard');

  console.log('\n📝 Example 2: Response with Tool Calls');
  const chatGptToolCalls = extractCitationsFromChatGPT(CHATGPT_EXAMPLES.withToolCalls);
  displayCitations(chatGptToolCalls, 'ChatGPT Tool Calls');

  console.log('\n📝 Example 3: Plain Text');
  const chatGptPlain = extractCitationsFromChatGPT(CHATGPT_EXAMPLES.plainText);
  displayCitations(chatGptPlain, 'ChatGPT Plain Text');

  // Perplexity Examples
  console.log('\n🔮 PERPLEXITY CITATION EXTRACTION');
  console.log('-'.repeat(30));

  console.log('\n📝 Example 1: API Response with Citations');
  const perplexityCitations = extractCitationsFromPerplexity(PERPLEXITY_EXAMPLES.withCitations);
  displayCitations(perplexityCitations, 'Perplexity Citations');

  console.log('\n📝 Example 2: Embedded Citations');
  const perplexityEmbedded = extractCitationsFromPerplexity(PERPLEXITY_EXAMPLES.embedded);
  displayCitations(perplexityEmbedded, 'Perplexity Embedded');

  // Claude Examples
  console.log('\n🧠 CLAUDE CITATION EXTRACTION');
  console.log('-'.repeat(30));

  console.log('\n📝 Example 1: Anthropic API Format');
  const claudeAnthropic = extractCitationsFromClaude(CLAUDE_EXAMPLES.anthropic);
  displayCitations(claudeAnthropic, 'Claude Anthropic');

  console.log('\n📝 Example 2: Simple Text Format');
  const claudeSimple = extractCitationsFromClaude(CLAUDE_EXAMPLES.simple);
  displayCitations(claudeSimple, 'Claude Simple');

  // Batch Processing Example
  console.log('\n📦 BATCH EXTRACTION EXAMPLE');
  console.log('-'.repeat(30));

  const responses = [
    CHATGPT_EXAMPLES.standard,
    PERPLEXITY_EXAMPLES.withCitations,
    CLAUDE_EXAMPLES.simple
  ];

  const batchCitations = batchExtractCitations(responses, 'mixed');
  console.log(`\n✅ Batch extracted ${batchCitations.length} citations from ${responses.length} responses`);

  // Validation and Deduplication
  console.log('\n🔍 VALIDATION & DEDUPLICATION');
  console.log('-'.repeat(30));

  const allCitations = [
    ...chatGptStandard,
    ...chatGptToolCalls,
    ...perplexityCitations,
    ...claudeAnthropic
  ];

  console.log(`Original citations: ${allCitations.length}`);

  const validatedCitations = validateCitations(allCitations);
  console.log(`After validation: ${validatedCitations.length}`);

  const deduplicatedCitations = deduplicateCitations(validatedCitations);
  console.log(`After deduplication: ${deduplicatedCitations.length}`);

  // Display final processed citations
  if (deduplicatedCitations.length > 0) {
    console.log('\n📋 FINAL PROCESSED CITATIONS');
    displayCitations(deduplicatedCitations.slice(0, 5), 'Final Results (first 5)');
  }

  return {
    chatGpt: {
      standard: chatGptStandard.length,
      toolCalls: chatGptToolCalls.length,
      plainText: chatGptPlain.length
    },
    perplexity: {
      citations: perplexityCitations.length,
      embedded: perplexityEmbedded.length
    },
    claude: {
      anthropic: claudeAnthropic.length,
      simple: claudeSimple.length
    },
    batch: batchCitations.length,
    validation: {
      original: allCitations.length,
      validated: validatedCitations.length,
      deduplicated: deduplicatedCitations.length
    }
  };
}

/**
 * Display citations in a formatted table
 * @param {Array} citations - Citations to display
 * @param {string} title - Section title
 */
function displayCitations(citations, title) {
  console.log(`\n📊 ${title}: ${citations.length} citations found`);
  
  if (citations.length === 0) {
    console.log('   No citations extracted');
    return;
  }

  citations.forEach((citation, index) => {
    console.log(`\n   ${index + 1}. ${citation.title || 'Untitled'}`);
    console.log(`      🔗 URL: ${citation.url}`);
    console.log(`      🌐 Domain: ${citation.domain}`);
    console.log(`      📝 Citation: ${citation.citation}`);
    console.log(`      📊 Source: ${citation.source}`);
    
    if (citation.batch_index !== undefined) {
      console.log(`      📦 Batch: ${citation.batch_index}`);
    }
  });
}

/**
 * Test citation extraction with custom input
 * @param {string} text - Text to extract citations from
 * @param {string} platform - Platform type
 */
function testCustomExtraction(text, platform = 'text') {
  console.log(`\n🧪 CUSTOM EXTRACTION TEST (${platform.toUpperCase()})`);
  console.log('-'.repeat(40));
  console.log(`Input text (${text.length} chars): ${text.substring(0, 100)}...`);
  
  const citations = extractCitations(text, platform);
  displayCitations(citations, 'Custom Test');
  
  return citations;
}

/**
 * Performance benchmark for citation extraction
 */
async function benchmarkExtraction() {
  console.log('\n⚡ EXTRACTION PERFORMANCE BENCHMARK');
  console.log('-'.repeat(40));

  const testCases = [
    { name: 'ChatGPT Standard', data: CHATGPT_EXAMPLES.standard, platform: 'chatgpt' },
    { name: 'Perplexity Citations', data: PERPLEXITY_EXAMPLES.withCitations, platform: 'perplexity' },
    { name: 'Claude Simple', data: CLAUDE_EXAMPLES.simple, platform: 'claude' },
    { name: 'Plain Text', data: CHATGPT_EXAMPLES.plainText, platform: 'text' }
  ];

  const results = [];

  for (const testCase of testCases) {
    const iterations = 100;
    const startTime = Date.now();
    
    let totalCitations = 0;
    for (let i = 0; i < iterations; i++) {
      const citations = extractCitations(testCase.data, testCase.platform);
      totalCitations += citations.length;
    }
    
    const duration = Date.now() - startTime;
    const avgTime = duration / iterations;
    const avgCitations = totalCitations / iterations;
    
    results.push({
      name: testCase.name,
      avgTime: avgTime.toFixed(2),
      avgCitations: avgCitations.toFixed(1),
      throughput: (1000 / avgTime).toFixed(1)
    });
    
    console.log(`✅ ${testCase.name}: ${avgTime.toFixed(2)}ms avg, ${avgCitations.toFixed(1)} citations avg`);
  }

  console.log('\n📊 BENCHMARK SUMMARY');
  results.forEach(result => {
    console.log(`   ${result.name}: ${result.throughput} extractions/sec`);
  });

  return results;
}

// Run demo if script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🧪 CITATION EXTRACTION EXAMPLES');
  console.log('='.repeat(50));
  
  runCitationDemo()
    .then(stats => {
      console.log('\n📈 EXTRACTION STATISTICS');
      console.log('='.repeat(50));
      console.log(JSON.stringify(stats, null, 2));
      
      // Run performance benchmark
      return benchmarkExtraction();
    })
    .then(benchmarkResults => {
      console.log('\n✨ Citation extraction demo completed!');
      console.log('\n💡 Key takeaways:');
      console.log('   - Different platforms require different extraction strategies');
      console.log('   - Always validate and deduplicate citations');
      console.log('   - Batch processing improves efficiency');
      console.log('   - The library handles multiple response formats automatically');
      
      console.log('\n📚 Next steps:');
      console.log('   - Test with your own AI response data');
      console.log('   - Integrate citation extraction into your analysis pipeline');
      console.log('   - Customize extraction patterns for your specific use case');
    })
    .catch(error => {
      console.error('\n💥 Demo failed:', error.message);
      process.exit(1);
    });
}

export { 
  runCitationDemo, 
  testCustomExtraction, 
  benchmarkExtraction,
  displayCitations,
  CHATGPT_EXAMPLES,
  PERPLEXITY_EXAMPLES,
  CLAUDE_EXAMPLES
};