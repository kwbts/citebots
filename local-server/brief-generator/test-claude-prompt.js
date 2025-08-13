#!/usr/bin/env node

/**
 * Test the exact Claude prompt and response format
 */

require('dotenv').config();
require('dotenv').config({ path: __dirname + '/.env' });

const Anthropic = require('@anthropic-ai/sdk');

async function testClaudePrompt() {
  console.log('Testing Claude prompt format...\n');
  
  const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!apiKey) {
    console.error('ERROR: No Claude API key found');
    process.exit(1);
  }
  
  try {
    const anthropic = new Anthropic({ apiKey });
    
    // Simplified test data
    const contextData = {
      briefParams: {
        title: "Composable MarTech for Junior Marketing Ops",
        keywords: ["composable martech", "marketing operations"],
        purpose: "Educate junior marketing ops professionals",
        audience: "Junior marketing operations professionals"
      },
      researchSummary: `Research shows that 73% of B2B companies use content marketing. 
      Companies with blogs generate 67% more leads. The martech industry is worth $412 billion.
      MarTech Podcast focuses on vendor interviews while Marketing Technology Podcast covers strategies.`,
      competitorDomains: ["martechpod.com", "marketingtechnologypodcast.com"]
    };
    
    // Create a simplified prompt focusing on statistics
    const prompt = `Analyze this research and return structured insights as JSON.

Brief Context:
Title: ${contextData.briefParams.title}
Keywords: ${contextData.briefParams.keywords.join(', ')}
Audience: ${contextData.briefParams.audience}

Research Summary:
${contextData.researchSummary}

Competitors: ${contextData.competitorDomains.join(', ')}

Return JSON with this exact structure:
{
  "strategicPositioning": "Your strategic positioning text here",
  "quotableStatistics": [
    {
      "statistic": "Exact statistic with number (e.g., '73% of B2B companies use content marketing')",
      "source": "Source attribution",
      "context": "Why this matters"
    }
  ],
  "competitiveLandscapeAnalysis": "Your competitive analysis here",
  "specificityRequirements": "Your specificity requirements here",
  "structuralRecommendations": "Your structural recommendations here",
  "brandVoiceGuidelines": "Your brand voice guidelines here",
  "uniqueValuePropositions": ["Value prop 1", "Value prop 2"]
}

Extract ALL statistics from the research that include specific numbers or percentages.`;
    
    console.log('Sending prompt to Claude...\n');
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });
    
    console.log('Response received!');
    console.log('\nRaw response:');
    console.log(response.content[0].text);
    
    // Try to parse as JSON
    try {
      const jsonStart = response.content[0].text.indexOf('{');
      const jsonEnd = response.content[0].text.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonText = response.content[0].text.substring(jsonStart, jsonEnd + 1);
        const parsed = JSON.parse(jsonText);
        console.log('\n\nParsed JSON:');
        console.log(JSON.stringify(parsed, null, 2));
        
        console.log('\n\nStatistics extracted:');
        if (parsed.quotableStatistics && Array.isArray(parsed.quotableStatistics)) {
          console.log(`Found ${parsed.quotableStatistics.length} statistics:`);
          parsed.quotableStatistics.forEach((stat, i) => {
            console.log(`\n${i + 1}. ${stat.statistic}`);
            console.log(`   Source: ${stat.source}`);
            console.log(`   Context: ${stat.context}`);
          });
        } else {
          console.log('No quotableStatistics array found in response');
          console.log('Keys in response:', Object.keys(parsed));
        }
      }
    } catch (parseError) {
      console.error('\nERROR parsing JSON:', parseError.message);
    }
    
  } catch (error) {
    console.error('\nERROR:', error.message);
  }
}

testClaudePrompt();