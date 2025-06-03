import { dataModelStructure } from './types';

export const mockAnalysisJourneyData = {
  // Keywords
  keywordCount: 25,
  keywordCategories: [
    { name: 'Branded', count: 8, percentage: 32 },
    { name: 'Product/Service', count: 10, percentage: 40 },
    { name: 'Informational', count: 5, percentage: 20 },
    { name: 'Competitor', count: 2, percentage: 8 }
  ],
  keywordData: [
    { keyword: 'email marketing software', category: 'Product/Service', queries: 6, brandMentions: 4 },
    { keyword: 'best email marketing platform', category: 'Product/Service', queries: 5, brandMentions: 3 },
    { keyword: 'mailchimp alternatives', category: 'Competitor', queries: 4, brandMentions: 3 },
    { keyword: 'how to create email newsletter', category: 'Informational', queries: 5, brandMentions: 2 },
    { keyword: 'email automation tools', category: 'Product/Service', queries: 4, brandMentions: 3 },
    { keyword: 'sendinblue vs mailchimp', category: 'Competitor', queries: 3, brandMentions: 2 },
    { keyword: 'sendinblue pricing', category: 'Branded', queries: 4, brandMentions: 4 },
    { keyword: 'sendinblue templates', category: 'Branded', queries: 3, brandMentions: 3 },
    { keyword: 'email deliverability tips', category: 'Informational', queries: 4, brandMentions: 1 },
    { keyword: 'sendinblue vs constant contact', category: 'Branded', queries: 3, brandMentions: 3 },
    { keyword: 'free email marketing tools', category: 'Product/Service', queries: 5, brandMentions: 2 },
    { keyword: 'best transactional email service', category: 'Product/Service', queries: 4, brandMentions: 3 }
  ],
  
  // Queries
  totalQueries: 50,
  queryIntentBreakdown: [
    { name: 'Informational', count: 25, percentage: 50 },
    { name: 'Commercial', count: 15, percentage: 30 },
    { name: 'Navigational', count: 5, percentage: 10 },
    { name: 'Transactional', count: 5, percentage: 10 }
  ],
  queryTypeBreakdown: [
    { name: 'Question', count: 20, percentage: 40 },
    { name: 'Comparison', count: 10, percentage: 20 },
    { name: 'How-to', count: 8, percentage: 16 },
    { name: 'Definition', count: 7, percentage: 14 },
    { name: 'List', count: 5, percentage: 10 }
  ],
  queryData: [
    { query: 'What is the best email marketing platform?', intent: 'Informational', type: 'Question', platform: 'ChatGPT', brandMentioned: true },
    { query: 'How does Sendinblue compare to Mailchimp?', intent: 'Commercial', type: 'Comparison', platform: 'ChatGPT', brandMentioned: true },
    { query: 'What are the best email marketing tools for small business?', intent: 'Commercial', type: 'List', platform: 'ChatGPT', brandMentioned: true },
    { query: 'How to create an email newsletter campaign?', intent: 'Informational', type: 'How-to', platform: 'ChatGPT', brandMentioned: false },
    { query: 'What is Sendinblue used for?', intent: 'Informational', type: 'Definition', platform: 'ChatGPT', brandMentioned: true },
    { query: 'Best email automation workflows', intent: 'Informational', type: 'List', platform: 'ChatGPT', brandMentioned: false },
    { query: 'How to improve email deliverability?', intent: 'Informational', type: 'How-to', platform: 'Perplexity', brandMentioned: false },
    { query: 'What is the best email marketing platform?', intent: 'Informational', type: 'Question', platform: 'Perplexity', brandMentioned: true },
    { query: 'How does Sendinblue compare to Mailchimp?', intent: 'Commercial', type: 'Comparison', platform: 'Perplexity', brandMentioned: true },
    { query: 'What is the pricing for Sendinblue?', intent: 'Commercial', type: 'Question', platform: 'Perplexity', brandMentioned: true },
    { query: 'How to set up email automation', intent: 'Informational', type: 'How-to', platform: 'Perplexity', brandMentioned: false },
    { query: 'Best email marketing templates', intent: 'Commercial', type: 'List', platform: 'Perplexity', brandMentioned: true }
  ],
  
  // Responses
  totalResponses: 100,
  brandMentions: 65,
  brandPagesCited: 18,
  responseData: [
    { query: 'What is the best email marketing platform?', platform: 'ChatGPT', responseOutcome: 'Elaborated Answer', brandMentionType: 'Primary Solution', sentiment: 'Positive', citationCount: 5 },
    { query: 'How does Sendinblue compare to Mailchimp?', platform: 'ChatGPT', responseOutcome: 'Direct Answer', brandMentionType: 'Primary Solution', sentiment: 'Positive', citationCount: 4 },
    { query: 'What are the best email marketing tools for small business?', platform: 'ChatGPT', responseOutcome: 'Elaborated Answer', brandMentionType: 'Alternative Solution', sentiment: 'Neutral', citationCount: 6 },
    { query: 'How to create an email newsletter campaign?', platform: 'ChatGPT', responseOutcome: 'Elaborated Answer', brandMentionType: null, sentiment: null, citationCount: 4 },
    { query: 'What is Sendinblue used for?', platform: 'ChatGPT', responseOutcome: 'Direct Answer', brandMentionType: 'Primary Subject', sentiment: 'Positive', citationCount: 3 },
    { query: 'Best email automation workflows', platform: 'ChatGPT', responseOutcome: 'Partial Answer', brandMentionType: null, sentiment: null, citationCount: 3 },
    { query: 'How to improve email deliverability?', platform: 'Perplexity', responseOutcome: 'Elaborated Answer', brandMentionType: null, sentiment: null, citationCount: 5 },
    { query: 'What is the best email marketing platform?', platform: 'Perplexity', responseOutcome: 'Elaborated Answer', brandMentionType: 'Primary Solution', sentiment: 'Positive', citationCount: 6 },
    { query: 'How does Sendinblue compare to Mailchimp?', platform: 'Perplexity', responseOutcome: 'Direct Answer', brandMentionType: 'Primary Solution', sentiment: 'Positive', citationCount: 5 },
    { query: 'What is the pricing for Sendinblue?', platform: 'Perplexity', responseOutcome: 'Direct Answer', brandMentionType: 'Primary Subject', sentiment: 'Neutral', citationCount: 2 },
    { query: 'How to set up email automation', platform: 'Perplexity', responseOutcome: 'Elaborated Answer', brandMentionType: null, sentiment: null, citationCount: 4 },
    { query: 'Best email marketing templates', platform: 'Perplexity', responseOutcome: 'Elaborated Answer', brandMentionType: 'Alternative Solution', sentiment: 'Positive', citationCount: 5 }
  ],
  
  // Citations
  totalCitations: 120,
  brandCitations: 42,
  competitorCitations: 58,
  citationData: [
    { url: 'https://www.sendinblue.com/features/email-marketing/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 9.2, queries: 8 },
    { url: 'https://www.sendinblue.com/pricing/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 8.7, queries: 6 },
    { url: 'https://www.sendinblue.com/features/email-templates/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 8.5, queries: 5 },
    { url: 'https://www.sendinblue.com/blog/email-deliverability-guide/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 7.8, queries: 4 },
    { url: 'https://www.mailchimp.com/pricing/', domain: 'mailchimp.com', isBrand: false, isCompetitor: true, competitorName: 'Mailchimp', relevance: 8.9, queries: 7 },
    { url: 'https://www.mailchimp.com/features/', domain: 'mailchimp.com', isBrand: false, isCompetitor: true, competitorName: 'Mailchimp', relevance: 8.7, queries: 8 },
    { url: 'https://www.constantcontact.com/email-marketing', domain: 'constantcontact.com', isBrand: false, isCompetitor: true, competitorName: 'Constant Contact', relevance: 7.9, queries: 5 },
    { url: 'https://www.getresponse.com/features', domain: 'getresponse.com', isBrand: false, isCompetitor: true, competitorName: 'GetResponse', relevance: 7.5, queries: 4 },
    { url: 'https://www.sendinblue.com/features/marketing-automation/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 9.0, queries: 7 },
    { url: 'https://www.sendinblue.com/blog/best-email-marketing-practices/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 8.3, queries: 5 },
    { url: 'https://www.campaignmonitor.com/resources/guides/email-marketing-guide/', domain: 'campaignmonitor.com', isBrand: false, isCompetitor: true, competitorName: 'Campaign Monitor', relevance: 8.1, queries: 6 },
    { url: 'https://emailmarketinghq.com/best-email-marketing-services/', domain: 'emailmarketinghq.com', isBrand: false, isCompetitor: false, relevance: 7.8, queries: 5 },
    { url: 'https://www.sendinblue.com/features/transactional-email/', domain: 'sendinblue.com', isBrand: true, isCompetitor: false, relevance: 8.9, queries: 7 },
    { url: 'https://www.activecampaign.com/email-marketing', domain: 'activecampaign.com', isBrand: false, isCompetitor: true, competitorName: 'ActiveCampaign', relevance: 8.4, queries: 6 },
    { url: 'https://www.wpbeginner.com/showcase/best-email-marketing-services/', domain: 'wpbeginner.com', isBrand: false, isCompetitor: false, relevance: 7.5, queries: 4 }
  ]
};