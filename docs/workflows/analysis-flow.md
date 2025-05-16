# Analysis Workflow

This document outlines the process for conducting LLM-based citation analysis for client domains.

## Overview

The analysis workflow involves configuring and executing queries across multiple LLMs to collect citation data for the client and competitor domains. The system tracks progress and provides notifications upon completion.

## Workflow Steps

### 1. Analysis Configuration

- Select client profile from dashboard
- Choose analysis type:
  - Brand analysis
  - Product/service analysis
  - Informational content analysis
  - Custom analysis (manual query selection)
- Configure LLM selection:
  - Default: All available LLMs
  - Option to select specific LLMs
- Set analysis scope:
  - Number of queries to execute
  - Prioritization method (high volume first, difficulty score, etc.)

### 2. Time Estimation

- System calculates estimated completion time based on:
  - Number of queries
  - Number of LLMs selected
  - Current system load
- User receives time estimate before execution
- Option to schedule for off-peak hours

### 3. Analysis Execution

- System executes queries in batches
- Progress tracking interface shows:
  - Completed queries (count and percentage)
  - Current query batch status
  - Estimated time remaining
  - Option to pause/resume

### 4. Data Processing

- Raw responses are parsed for citations
- Citation data is structured and categorized
- Results are associated with client profile
- Data is stored in Supabase

### 5. Completion Notification

- Email notification sent upon completion
- Optional Slack integration for team alerts
- Dashboard notification in UI

## Success Criteria

- All selected queries executed successfully
- Citation data collected and structured
- Results accessible via dashboard
- Notification delivered to user

## Next Steps

After analysis is complete, the user can proceed to the [Recommendation Flow](./recommendation-flow.md) to generate actionable insights.