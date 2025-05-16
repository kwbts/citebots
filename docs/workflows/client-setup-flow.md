# Client Setup Workflow

This document outlines the process for setting up a new client in the Citebots system.

## Overview

The client setup process involves collecting essential information about the client's brand, competitors, and target keywords. This data serves as the foundation for all subsequent analysis and reporting.

## Workflow Steps

### 1. Brand Information Entry

- Enter client brand name
- Specify primary domain URL
- Add additional owned domains (if applicable)
- Upload brand logo (optional)
- Set primary contact information

### 2. Competitor Identification

- System automatically suggests up to 5 competitors based on domain analysis
- User can manually add or remove competitors
- Each competitor requires domain URL
- Optional metadata for each competitor (company size, focus areas)

### 3. Query Parameter Selection

- Select relevant query intent parameters:
  - Geographic targeting (global, regional, local)
  - Industry vertical
  - Customer segment (B2B, B2C, etc.)
  - Content types (technical, marketing, informational)

### 4. Keyword Management

- Import keyword list via CSV or direct entry
- System transforms keywords into natural language queries
- Keywords are categorized automatically by intent
- User can manually adjust categorization

### 5. Profile Saving

- All client data is saved to Supabase
- Client profile is assigned a unique identifier
- Confirmation email sent to admin user

## Success Criteria

- Client profile is created in the database
- All required fields are populated
- At least one competitor is identified
- Minimum of 10 keywords are processed

## Next Steps

After client setup is complete, the user can proceed to the [Analysis Flow](./analysis-flow.md) to begin generating insights.