// src/lib/contentAnalyzer.js
const { OpenAI } = require('openai');
const config = require('../config');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || config.openai.apiKey
});

/**
 * Analyze a webpage using OpenAI
 * @param {Object} pageData - The page data to analyze
 * @param {string} queryText - The original query text for context
 * @returns {Promise<Object>} - Analysis data
 */
async function analyzeContent(pageData, queryText) {
  try {
    console.log(`Analyzing content with OpenAI for: ${pageData.url}`);
    
    // Check if we have main content or use content snippet if available
    const contentToAnalyze = pageData.main_content || pageData.contentSnippet || '';
    
    // Create a content sample - use the first 1500 characters for analysis
    const contentSample = contentToAnalyze.substring(0, 1500) + (contentToAnalyze.length > 1500 ? '...' : '');
    
    // Prepare a structured prompt to analyze the content
    const prompt = `
I need you to analyze a web page that was cited in response to the query: "${queryText}".

Here's some information about the page:
URL: ${pageData.url}
Title: ${pageData.pageTitle || 'N/A'}
Content sample: ${contentSample}
Meta description: ${pageData.metaDescription || 'N/A'}
Word count: ${pageData.wordCount || 'N/A'}

Additional technical details:
- Schema markup present: ${pageData.schemaMarkupPresent ? 'Yes' : 'No'}
- Schema types: ${pageData.schemaTypes || 'None'}
- Has tables: ${pageData.has_table ? 'Yes' : 'No'}
- Has unordered lists: ${pageData.has_unordered_list ? 'Yes' : 'No'}
- Has ordered lists: ${pageData.has_ordered_list ? 'Yes' : 'No'}
- Total headings: ${pageData.total_headings || 0}
- ARIA labels present: ${pageData.aria_labels_present ? 'Yes' : 'No'}

Based on this information, please analyze the content and provide the following classifications and scores:

1. CONTENT TYPE classification: What type of content is this? (Blog, Product, Documentation, etc.)

2. ROCK-PAPER-SCISSORS classification:
   - Rock: Foundational content, pillar-type content
   - Paper: Thin content that tries to cover a lot of ground
   - Scissors: Opinion based pieces, reviews, blogs, or forums
   - Lizard: Time-based content (e.g., "best podcasts in 2025")
   - Spock: Imaginative, speculative, clearly unique content

3. SENTIMENT SCORE: Is the content negative (-1), neutral (0), or positive (+1)? You can use values in between.

4. CITATION MATCH QUALITY: On a scale of 1-10, how well does this content match the query and make sense as a citation?

5. CONTENT DEPTH SCORE: On a scale of 1-10, how deeply does the content cover the subject? Consider if it provides surface-level information or demonstrates in-depth knowledge.

6. GPT CONTENT SCORE: On a scale of 1-10, rate the overall quality of the content. Have high standards - as someone who reads a lot online, you can recognize high vs. low quality content.

7. ANALYSIS NOTES: Provide qualitative analysis on why this piece might rank well.

8. TOPICAL CLUSTER: Identify the high-level topic that best describes the focus of this page (2-4 words, like "Marketing Podcasts" or "Content Strategy Tools").

9. For each of the following, indicate TRUE or FALSE:
   - HAS_CITATION: Does the page use external citations?
   - HAS_RESEARCH: Does the content show clear evidence of research?
   - HAS_STATISTICS: Does it use statistics to back up claims?
   - HAS_QUOTES: Does it provide quotes from others in the industry?

10. READING SCORE: On a scale of 1-10, analyze the readability following Flesch-Kincaid methodology.

11. CONTENT UNIQUENESS: On a scale of 1-10, how unique is this content in its presentation style, research, or approach?

12. CONTENT OPTIMIZATION SCORE: On a scale of 1-10, how well is the content optimized both for this query and in general?

13. KEYWORD MATCH: What are the 3 most relevant keywords or phrases on this page related to the query? (maximum 4 words per phrase)

14. PAGE RELEVANCE TYPE: How relevant is this page to the query? Choose one:
   - direct: Page directly addresses the query topic
   - partial: Page covers some aspects of the query
   - tangential: Page is related but not specifically about the query
   - misaligned: Page doesn't address the query effectively
   - comprehensive: Page covers more than what was asked in the query
   - narrow: Page covers less than what was asked in the query

15. PAGE INTENT ALIGNMENT: How well does the page's purpose align with the query's intent? Choose one:
   - high_match: Page perfectly satisfies the query intent
   - moderate_match: Page addresses the query intent but not completely
   - low_match: Page partially addresses query intent
   - mismatch: Page purpose does not align with query intent
   - over_delivery: Page provides more than the query intent requires
   - under_delivery: Page provides less than the query intent requires

16. CONTENT FORMAT: What is the primary content format of the page? Choose one:
   - article: Traditional article or blog post
   - product_page: Product description or feature page
   - comparison: Comparative analysis of multiple options
   - how_to: Step-by-step tutorial or guide
   - reference: Reference material, glossary, or definition
   - case_study: Detailed examination of a specific instance
   - resource_hub: Collection of multiple resources
   - tool: Interactive tool or calculator
   - landing_page: Marketing-focused conversion page
   - review: Product or service review

17. CONTENT DEPTH: How comprehensive is the page's content? Choose one:
   - shallow: Basic information with minimal details
   - overview: General coverage of the topic
   - intermediate: Moderate level of detail and explanation
   - comprehensive: Thorough coverage with substantial details
   - expert: In-depth, specialized information for advanced users

18. BRAND POSITIONING: How is the brand positioned on this page? Choose one:
   - central: Brand is the main focus of the page
   - authority: Brand positioned as an expert or authority
   - solution: Brand presented as a solution to a problem
   - option: Brand presented as one option among many
   - peripheral: Brand mentioned briefly or tangentially
   - absent: Brand not explicitly mentioned on the page

19. COMPETITOR PRESENCE: How are competitors featured on this page? Choose one:
   - none: No competitors mentioned
   - single_competitor: One competitor mentioned
   - multiple_competitors: Multiple competitors mentioned
   - comparison_favorable: Competitors mentioned with brand portrayed favorably
   - comparison_neutral: Neutral comparison with competitors
   - comparison_unfavorable: Competitors mentioned with brand portrayed unfavorably
   - competitor_focused: Page primarily about competitors

20. CALL TO ACTION STRENGTH: How strong are the calls to action on this page? Choose one:
   - none: No calls to action present
   - passive: Subtle or implied actions (e.g., "Learn more")
   - moderate: Clear but not urgent actions (e.g., "Download our guide")
   - strong: Prominent conversion-focused actions (e.g., "Buy now," "Sign up today")
   - multiple: Several different calls to action
   - journey: Series of actions creating a user journey

21. CONTENT RECENCY: How current is this content? Choose one:
   - current: Up-to-date information (within last 3 months)
   - recent: Relatively recent information (3-12 months)
   - outdated: Older information (1-3 years)
   - obsolete: Significantly outdated information (3+ years)
   - evergreen: Content that remains relevant regardless of time
   - undated: No clear publication or update date

22. E-E-A-T SIGNALS: How strong are the Experience, Expertise, Authoritativeness, and Trustworthiness signals? Choose one:
   - strong: Abundant signals of E-E-A-T throughout
   - moderate: Some signals of E-E-A-T present
   - weak: Minimal E-E-A-T signals
   - mixed: Strong in some E-E-A-T areas but weak in others
   - misleading: Contains signals that may undermine E-E-A-T

23. USER EXPERIENCE QUALITY: How is the overall user experience of the page? Choose one:
   - excellent: Clean, engaging, easy to navigate
   - good: Generally positive experience with minor issues
   - average: Functional but unremarkable
   - poor: Significant usability or design issues
   - problematic: Major issues impacting usability

24. CONTENT STRUCTURE: How is the content organized on the page? Choose one:
   - sequential: Linear, step-by-step organization
   - hierarchical: Organized by importance or categories
   - comparative: Structured around comparisons
   - q_and_a: Question and answer format
   - narrative: Story-based structure
   - encyclopedic: Comprehensive, reference-style organization
   - fragmented: Poorly organized or disconnected sections

Please format your response as a JSON object with these exact field names: 
rock_paper_scissors, sentiment_score, citation_match_quality, content_depth_score, content_type, gpt_content_score, analysis_notes, topical_cluster, has_citation, has_research, has_statistics, has_quotes, reading_score, content_uniqueness, content_optimization_score, keyword_match, page_relevance_type, page_intent_alignment, content_format, content_depth, brand_positioning, competitor_presence, call_to_action_strength, content_recency, eeat_signals, user_experience_quality, content_structure

All scores should be numerical values and text fields should be strings. Boolean values should be true/false. The keyword_match should be an array of 3 strings.`;

    // Make the API call
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: "system", content: "You are a content analyst specialized in evaluating web content for citation quality and SEO factors." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    // Extract and parse the JSON response
    const content = response.choices[0].message.content;
    let analysisData;
    
    try {
      analysisData = JSON.parse(content);
      console.log(`Successfully parsed OpenAI analysis for ${pageData.url}`);
    } catch (parseError) {
      console.error(`Error parsing OpenAI response: ${parseError.message}`);
      console.log(`Raw content: ${content}`);
      // Create a default response
      analysisData = {
        rock_paper_scissors: "Rock",
        sentiment_score: 0,
        citation_match_quality: 5,
        content_depth_score: 5,
        content_type: "Unknown",
        gpt_content_score: 5,
        analysis_notes: "Error parsing analysis.",
        topical_cluster: "General Information",
        has_citation: false, 
        has_research: false,
        has_statistics: false,
        has_quotes: false,
        reading_score: 5,
        content_uniqueness: 5,
        content_optimization_score: 5,
        keyword_match: [
          "webpage content",
          "information",
          "online resource"
        ],
        page_relevance_type: "partial",
        page_intent_alignment: "moderate_match",
        content_format: "article",
        content_depth: "overview",
        brand_positioning: "absent",
        competitor_presence: "none",
        call_to_action_strength: "passive",
        content_recency: "undated",
        eeat_signals: "moderate",
        user_experience_quality: "average",
        content_structure: "hierarchical"
      };
    }
    
    return analysisData;
  } catch (error) {
    console.error(`Error analyzing content: ${error.message}`);
    // Return default values on error
    return {
      rock_paper_scissors: "Rock",
      sentiment_score: 0,
      citation_match_quality: 5,
      content_depth_score: 5,
      content_type: "Unknown",
      gpt_content_score: 5,
      analysis_notes: `Error during analysis: ${error.message}`,
      topical_cluster: "General Information",
      has_citation: false, 
      has_research: false,
      has_statistics: false,
      has_quotes: false,
      reading_score: 5,
      content_uniqueness: 5,
      content_optimization_score: 5,
      keyword_match: [
        "webpage content",
        "information",
        "online resource"
      ],
      page_relevance_type: "partial",
      page_intent_alignment: "moderate_match",
      content_format: "article",
      content_depth: "overview",
      brand_positioning: "absent",
      competitor_presence: "none",
      call_to_action_strength: "passive",
      content_recency: "undated",
      eeat_signals: "moderate",
      user_experience_quality: "average",
      content_structure: "hierarchical"
    };
  }
}

module.exports = {
  analyzeContent
};