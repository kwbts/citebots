// Analysis Journey Data Models

export interface KeywordCategory {
  name: string;
  count: number;
  percentage: number;
}

export interface KeywordData {
  keyword: string;
  category: string;
  queries: number;
  brandMentions: number;
  source?: string;
}

export interface QueryIntent {
  name: string;
  count: number;
  percentage: number;
}

export interface QueryType {
  name: string;
  count: number;
  percentage: number;
}

export interface QueryData {
  query: string;
  intent: string;
  type: string;
  platform: string;
  brandMentioned: boolean;
  sentiment?: string;
}

export interface ResponseData {
  query: string;
  platform: string;
  responseOutcome: string;
  brandMentionType: string;
  sentiment: string;
  citationCount: number;
}

export interface CitationData {
  url: string;
  domain: string;
  isBrand: boolean;
  isCompetitor: boolean;
  competitorName?: string;
  relevance: number;
  queries: number;
}

export interface AnalysisJourneyData {
  // Keywords
  keywordCount: number;
  keywordCategories: KeywordCategory[];
  keywordData: KeywordData[];

  // Queries
  totalQueries: number;
  queryIntentBreakdown: QueryIntent[];
  queryTypeBreakdown: QueryType[];
  queryData: QueryData[];

  // Responses
  totalResponses: number;
  brandMentions: number;
  brandPagesCited: number;
  responseData: ResponseData[];

  // Citations
  totalCitations: number;
  brandCitations: number;
  competitorCitations: number;
  citationData: CitationData[];
}

// For backwards compatibility with components that import from 'types.js'
export const dataModelStructure = {
  keywordCount: 0,
  keywordCategories: [],
  keywordData: [],
  totalQueries: 0,
  queryIntentBreakdown: [],
  queryTypeBreakdown: [],
  queryData: [],
  totalResponses: 0,
  brandMentions: 0,
  brandPagesCited: 0,
  responseData: [],
  totalCitations: 0,
  brandCitations: 0,
  competitorCitations: 0,
  citationData: []
};