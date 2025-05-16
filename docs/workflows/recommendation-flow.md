# Recommendation Workflow

This document outlines the process for generating AI-powered recommendations based on citation analysis data.

## Overview

The recommendation workflow leverages collected citation data to generate actionable insights for improving the client's GEO performance. The system analyzes patterns and applies rule-based and AI-driven methods to identify opportunities.

## Workflow Steps

### 1. Data Selection

- Select client profile from dashboard
- Choose analysis dataset(s) to use for recommendations
- Option to include historical data for trend analysis
- Filter options by query type, date range, and LLM

### 2. Recommendation Types

#### Global Recommendations

- Technical SEO improvements based on citation patterns
- Brand positioning recommendations vs. competitors
- Overall content strategy direction

#### Content Recommendations

- Prioritized query opportunities (top 10 by default)
- Content gap analysis between brand and competitors
- Page update priorities based on:
  - Freshness metrics
  - Citation frequency
  - Competitor performance

### 3. Rule-Based Insights

Automatic triggers for recommendations based on specific conditions:

- **Competitor Advantage Detection**:
  - When competitors consistently outperform in specific query categories
  - When competitors' content is cited more frequently for high-value queries

- **Defender Advantage**:
  - When client maintains citation lead in key areas
  - Recommendations focus on updating and maintaining core pages

### 4. External Data Integration

- Incorporation of G2Crowd review analysis:
  - Feature identification and comparison
  - Sentiment analysis
  - Competitor positioning
  - Previous system or incumbent solution comparisons

### 5. Report Generation

- Comprehensive recommendation report generation
- Exportable in multiple formats (PDF, CSV, API)
- Shareable link generation with access controls

## Report Structure

### Basic Report Triad

- **Brand Analysis**:
  - Brand perception in LLM responses
  - Citation frequency for brand-related queries
  - Competitive positioning

- **Product Marketing/Research**:
  - Product feature citation analysis
  - Competitive feature comparison
  - Market positioning opportunities

- **Content/Informational**:
  - High-value content opportunities
  - Content gap analysis
  - Updating priorities for existing content

## Success Criteria

- Actionable recommendations generated
- Clear prioritization of opportunities
- Specific content suggestions provided
- Report successfully delivered to user

## Advanced Reporting Extensions

### Future Capabilities

- **Persona-Based Queries**:
  - Analysis segmented by buyer persona
  - Customized recommendations per persona

- **Customer Journey Queries**:
  - Analysis mapped to customer journey stages
  - Recommendations for improving each journey stage