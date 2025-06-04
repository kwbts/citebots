/**
 * EEAT Analyzer Module
 * 
 * Comprehensive analysis of Experience, Expertise, Authoritativeness, and Trustworthiness
 * based on Google's EEAT guidelines and content quality signals
 */

import OpenAI from 'openai';

/**
 * Analyze EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) 
 * as the final step in content analysis
 * 
 * @param {Object} options - Analysis options and data
 * @param {string} options.url - URL of the page
 * @param {string} options.html - HTML content of the page
 * @param {string} options.textContent - Extracted text content
 * @param {Object} options.technicalSeo - Technical SEO analysis results
 * @param {Object} options.onPageSeo - On-page SEO analysis results
 * @param {Object} options.contentQuality - Content quality analysis results
 * @param {Object} options.pagePerformance - Page performance metrics
 * @param {Object} options.domainAuthority - Domain authority metrics
 * @param {Object} options.pageAnalysis - Page analysis results
 * @returns {Object} - Detailed EEAT analysis
 */
export async function analyzeEEAT(options) {
  const {
    url,
    html,
    textContent,
    technicalSeo,
    onPageSeo,
    contentQuality,
    pagePerformance,
    domainAuthority,
    pageAnalysis
  } = options;

  if (!html || !process.env.OPENAI_API_KEY) {
    return getDefaultEEATAnalysis();
  }

  try {
    console.log(`\n🧠 EEAT ANALYSIS PHASE - Analyzing Experience, Expertise, Authoritativeness, and Trustworthiness`);
    
    // Create OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Extract domain from URL
    const domain = new URL(url).hostname;
    
    // Truncate content to avoid token limits
    const truncatedContent = textContent.substring(0, 6000);
    
    // Prepare the prompt with all available data
    const prompt = `
Analyze the EEAT (Experience, Expertise, Authoritativeness, Trustworthiness) signals in this content:

DOMAIN: ${domain} (Domain Authority: ${domainAuthority.domain_authority || 'N/A'})
PAGE AUTHORITY: ${domainAuthority.page_authority || 'N/A'}
REFERRING DOMAINS: ${domainAuthority.referring_domains || 'N/A'}
SCHEMA TYPES: ${technicalSeo.schema_types?.join(', ') || 'None detected'}
DATE PUBLISHED: ${technicalSeo.date_created || 'Not found'}
DATE MODIFIED: ${technicalSeo.date_modified || 'Not found'}
CONTENT TYPE: ${onPageSeo.content_type || contentQuality.content_type || 'Unknown'}
CONTENT STRUCTURE: ${pageAnalysis.content_structure || 'Unknown'}
AUTHORSHIP CLEAR: ${onPageSeo.authorship_clear ? 'Yes' : 'No'}
WORD COUNT: ${onPageSeo.word_count || 0}

URL: ${url}

CONTENT SNIPPET: 
${truncatedContent.substring(0, 3000)}

For each EEAT dimension, identify specific signals present or absent in the content and provide a detailed assessment.

EXPERIENCE ASSESSMENT:
- Score (1-10): 
- Evidence of first-person experience:
- Details suggesting real-world application:
- Case studies or specific examples:
- Expert commentary:
- Temporal markers showing long-term involvement:

EXPERTISE ASSESSMENT:
- Score (1-10):
- Technical depth appropriate to topic:
- Proper use of industry terminology:
- Quality of explanations:
- References to research/data:
- Level of detail and specificity:
- Industry knowledge demonstration:

AUTHORITATIVENESS ASSESSMENT:
- Score (1-10):
- Domain credibility factors:
- Recognition within industry (based on content):
- Comprehensiveness expected of an authority:
- Quality of external citations:
- Content depth compared to typical authority sources:
- Credentials or qualifications mentioned:

TRUSTWORTHINESS ASSESSMENT:
- Score (1-10):
- Balance in presenting information:
- Transparency about limitations:
- Fact vs. opinion distinction:
- Currency of information:
- Disclosure and attribution practices:
- Content accuracy indicators:
- Presence of citations or references:

OVERALL EEAT SCORE: (1-10)

KEY STRENGTHS:
[List top 3 EEAT strengths]

KEY IMPROVEMENT AREAS:
[List top 3 EEAT weaknesses]

Format response as JSON.
`;

    // Call GPT-4o-mini
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in analyzing web content for Experience, Expertise, Authoritativeness, and Trustworthiness (EEAT) signals according to search quality evaluator guidelines. Provide detailed, specific assessments for each EEAT dimension based on the content provided. Return ONLY valid JSON with the exact fields requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });
    
    // Parse the response
    const result = JSON.parse(response.choices[0].message.content);
    
    // Normalize scores to ensure they're on a 1-10 scale
    const normalizeScore = (score, defaultValue = 5) => {
      if (score === undefined || score === null) return defaultValue;
      
      const numScore = Number(score);
      if (isNaN(numScore)) return defaultValue;
      
      if (numScore >= 1 && numScore <= 10) return numScore;
      
      if (numScore >= 0 && numScore <= 5) {
        return Math.round((numScore * 2) - 1);
      }
      
      return defaultValue;
    };
    
    // Create the final analysis object
    const eeatAnalysis = {
      // Overall score
      eeat_score: normalizeScore(result.OVERALL_EEAT_SCORE),
      
      // Experience dimension
      experience: {
        score: normalizeScore(result.EXPERIENCE_ASSESSMENT?.Score),
        evidence: result.EXPERIENCE_ASSESSMENT?.['Evidence of first-person experience'] || 'None detected',
        real_world_application: result.EXPERIENCE_ASSESSMENT?.['Details suggesting real-world application'] || 'None detected',
        case_studies: result.EXPERIENCE_ASSESSMENT?.['Case studies or specific examples'] || 'None detected',
        expert_commentary: result.EXPERIENCE_ASSESSMENT?.['Expert commentary'] || 'None detected',
        temporal_markers: result.EXPERIENCE_ASSESSMENT?.['Temporal markers showing long-term involvement'] || 'None detected'
      },
      
      // Expertise dimension
      expertise: {
        score: normalizeScore(result.EXPERTISE_ASSESSMENT?.Score),
        technical_depth: result.EXPERTISE_ASSESSMENT?.['Technical depth appropriate to topic'] || 'None detected',
        terminology_usage: result.EXPERTISE_ASSESSMENT?.['Proper use of industry terminology'] || 'None detected',
        explanation_quality: result.EXPERTISE_ASSESSMENT?.['Quality of explanations'] || 'None detected',
        research_references: result.EXPERTISE_ASSESSMENT?.['References to research/data'] || 'None detected',
        detail_level: result.EXPERTISE_ASSESSMENT?.['Level of detail and specificity'] || 'None detected',
        industry_knowledge: result.EXPERTISE_ASSESSMENT?.['Industry knowledge demonstration'] || 'None detected'
      },
      
      // Authoritativeness dimension
      authoritativeness: {
        score: normalizeScore(result.AUTHORITATIVENESS_ASSESSMENT?.Score),
        domain_credibility: result.AUTHORITATIVENESS_ASSESSMENT?.['Domain credibility factors'] || 'None detected',
        industry_recognition: result.AUTHORITATIVENESS_ASSESSMENT?.['Recognition within industry (based on content)'] || 'None detected',
        comprehensiveness: result.AUTHORITATIVENESS_ASSESSMENT?.['Comprehensiveness expected of an authority'] || 'None detected',
        citation_quality: result.AUTHORITATIVENESS_ASSESSMENT?.['Quality of external citations'] || 'None detected',
        content_depth: result.AUTHORITATIVENESS_ASSESSMENT?.['Content depth compared to typical authority sources'] || 'None detected',
        credentials: result.AUTHORITATIVENESS_ASSESSMENT?.['Credentials or qualifications mentioned'] || 'None detected'
      },
      
      // Trustworthiness dimension
      trustworthiness: {
        score: normalizeScore(result.TRUSTWORTHINESS_ASSESSMENT?.Score),
        information_balance: result.TRUSTWORTHINESS_ASSESSMENT?.['Balance in presenting information'] || 'None detected',
        limitation_transparency: result.TRUSTWORTHINESS_ASSESSMENT?.['Transparency about limitations'] || 'None detected',
        fact_opinion_distinction: result.TRUSTWORTHINESS_ASSESSMENT?.['Fact vs. opinion distinction'] || 'None detected',
        information_currency: result.TRUSTWORTHINESS_ASSESSMENT?.['Currency of information'] || 'None detected',
        attribution_practices: result.TRUSTWORTHINESS_ASSESSMENT?.['Disclosure and attribution practices'] || 'None detected',
        accuracy_indicators: result.TRUSTWORTHINESS_ASSESSMENT?.['Content accuracy indicators'] || 'None detected',
        citation_presence: result.TRUSTWORTHINESS_ASSESSMENT?.['Presence of citations or references'] || 'None detected'
      },
      
      // Summary information
      strengths: result.KEY_STRENGTHS || [],
      improvement_areas: result.KEY_IMPROVEMENT_AREAS || []
    };
    
    // Log key information about the EEAT analysis
    console.log(`✅ EEAT ANALYSIS COMPLETE`);
    console.log(`📊 EEAT SCORES:`);
    console.log(`  - Overall EEAT Score: ${eeatAnalysis.eeat_score}/10`);
    console.log(`  - Experience Score: ${eeatAnalysis.experience.score}/10`);
    console.log(`  - Expertise Score: ${eeatAnalysis.expertise.score}/10`);
    console.log(`  - Authoritativeness Score: ${eeatAnalysis.authoritativeness.score}/10`);
    console.log(`  - Trustworthiness Score: ${eeatAnalysis.trustworthiness.score}/10`);
    console.log(`📝 KEY STRENGTHS:`);
    eeatAnalysis.strengths.forEach((strength, index) => {
      console.log(`  ${index + 1}. ${strength}`);
    });
    console.log(`🔍 IMPROVEMENT AREAS:`);
    eeatAnalysis.improvement_areas.forEach((area, index) => {
      console.log(`  ${index + 1}. ${area}`);
    });
    
    return eeatAnalysis;
    
  } catch (error) {
    console.error('Error analyzing EEAT:', error);
    return getDefaultEEATAnalysis();
  }
}

/**
 * Get default EEAT analysis when analysis fails
 * @returns {Object} - Default EEAT analysis
 */
function getDefaultEEATAnalysis() {
  return {
    eeat_score: 5,
    experience: {
      score: 5,
      evidence: 'None detected',
      real_world_application: 'None detected',
      case_studies: 'None detected',
      expert_commentary: 'None detected',
      temporal_markers: 'None detected'
    },
    expertise: {
      score: 5,
      technical_depth: 'None detected',
      terminology_usage: 'None detected',
      explanation_quality: 'None detected',
      research_references: 'None detected',
      detail_level: 'None detected',
      industry_knowledge: 'None detected'
    },
    authoritativeness: {
      score: 5,
      domain_credibility: 'None detected',
      industry_recognition: 'None detected',
      comprehensiveness: 'None detected',
      citation_quality: 'None detected',
      content_depth: 'None detected',
      credentials: 'None detected'
    },
    trustworthiness: {
      score: 5,
      information_balance: 'None detected',
      limitation_transparency: 'None detected',
      fact_opinion_distinction: 'None detected',
      information_currency: 'None detected',
      attribution_practices: 'None detected',
      accuracy_indicators: 'None detected',
      citation_presence: 'None detected'
    },
    strengths: ['Default analysis - no strengths identified'],
    improvement_areas: ['Default analysis - no improvement areas identified']
  };
}