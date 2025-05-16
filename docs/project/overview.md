# Citebots - GEO Analytics Application

## Project Overview

Citebots is an internal application for Generative Engine Optimization (GEO) services. It programmatically collects responses from LLMs (ChatGPT, Claude, Perplexity, Gemini, etc.) to analyze citations for client domains, providing valuable data to guide GEO strategy.

## Purpose and Value

- Track client citations in LLM responses
- Guide technical SEO improvements
- Inform content strategy for specific query types
- Generate insights and recommendations based on citation patterns

## Validation Status

- Successfully tested backend script with 650+ queries
- Collected 100+ data points across: 
  - Technical SEO metrics
  - On-page SEO factors
  - Page speed performance
  - Domain statistics
  - AI-based content analysis

## Access and Security

- Private admin application at citebots.com
- Team-only access with login authentication
- Potential view-only client access for select features
- No public access to proprietary tools/IP

## Core Requirements

1. Data Storage (Supabase)
   - User authentication data
   - Client and competitor profiles
   - Analysis and benchmark data
   - Query results and citation metrics

2. User Authentication
   - Secure login for team members
   - Role-based access permissions
   - Optional view-only access for clients

3. Client Profile Management
   - Brand and competitor domains tracking
   - Query intent parameter selection
   - Keyword list management and transformation
   - Persistent client data storage

4. Analysis Engine
   - Query setup and execution interface
   - Progress tracking with time estimates
   - Email/Slack notifications for completed analyses

5. Reporting & Visualization
   - Category-based metric dashboards
   - Citation pattern analysis
   - Brand vs. competitor performance

6. AI Recommendation System
   - Query-specific insights generation
   - Pattern identification in citation data
   - Content gap analysis
   - Technical improvement suggestions

## Future Expansion Capabilities

- Benchmark data collection (privacy-respecting)
- Machine learning model integration
- Advanced competitive analysis