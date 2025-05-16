# Client Profiles Implementation

## Overview

The Client Profiles feature manages information about client brands, competitors, and query parameters. This document outlines the implementation details of this feature.

## Architecture

### Components

1. **Profile Manager**
   - Creates and updates client records
   - Manages brand and domain information
   - Provides profile retrieval functionality

2. **Competitor Tracker**
   - Identifies and tracks competitor domains
   - Manages competitor relationships
   - Updates competitor information

3. **Keyword Manager**
   - Imports and categorizes keywords
   - Transforms keywords into natural language queries
   - Provides keyword prioritization

4. **Profile Storage**
   - Handles data persistence
   - Enforces data validation
   - Manages profile versioning

## Implementation Details

### Client Profile Creation

```javascript
// Simplified client profile creation logic
async function createClientProfile(profile) {
  try {
    // Validate profile data
    validateProfile(profile);
    
    // Insert client record
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        name: profile.name,
        domain: profile.domain,
        industry: profile.industry,
        contact_email: profile.contactEmail
      })
      .single();
    
    if (clientError) throw clientError;
    
    // Insert domains
    if (profile.additionalDomains && profile.additionalDomains.length > 0) {
      const { error: domainsError } = await supabase
        .from('client_domains')
        .insert(profile.additionalDomains.map(domain => ({
          client_id: client.id,
          domain: domain
        })));
      
      if (domainsError) throw domainsError;
    }
    
    // Return the created client profile
    return client;
  } catch (error) {
    console.error('Error creating client profile:', error.message);
    throw error;
  }
}
```

### Competitor Management

```javascript
// Simplified competitor management logic
async function manageCompetitors(clientId, competitors) {
  try {
    // Get existing competitors
    const { data: existing, error: fetchError } = await supabase
      .from('competitors')
      .select('*')
      .eq('client_id', clientId);
    
    if (fetchError) throw fetchError;
    
    // Identify competitors to add, update, and remove
    const existingDomains = existing.map(comp => comp.domain);
    const newDomains = competitors.map(comp => comp.domain);
    
    const toAdd = competitors.filter(comp => !existingDomains.includes(comp.domain));
    const toRemove = existing.filter(comp => !newDomains.includes(comp.domain));
    const toUpdate = competitors.filter(comp => existingDomains.includes(comp.domain));
    
    // Add new competitors
    if (toAdd.length > 0) {
      const { error: addError } = await supabase
        .from('competitors')
        .insert(toAdd.map(comp => ({
          client_id: clientId,
          domain: comp.domain,
          name: comp.name,
          description: comp.description
        })));
      
      if (addError) throw addError;
    }
    
    // Remove competitors
    if (toRemove.length > 0) {
      const { error: removeError } = await supabase
        .from('competitors')
        .delete()
        .in('id', toRemove.map(comp => comp.id));
      
      if (removeError) throw removeError;
    }
    
    // Update competitors
    for (const comp of toUpdate) {
      const { error: updateError } = await supabase
        .from('competitors')
        .update({
          name: comp.name,
          description: comp.description
        })
        .eq('client_id', clientId)
        .eq('domain', comp.domain);
      
      if (updateError) throw updateError;
    }
    
    return { added: toAdd.length, removed: toRemove.length, updated: toUpdate.length };
  } catch (error) {
    console.error('Error managing competitors:', error.message);
    throw error;
  }
}
```

### Keyword Processing

```javascript
// Simplified keyword processing logic
function processKeywords(keywords, intent) {
  // Clean and normalize keywords
  const processed = keywords.map(keyword => ({
    original: keyword,
    normalized: normalizeKeyword(keyword),
    intent: detectIntent(keyword) || intent
  }));
  
  // Group by intent
  const byIntent = {};
  for (const kw of processed) {
    if (!byIntent[kw.intent]) {
      byIntent[kw.intent] = [];
    }
    byIntent[kw.intent].push(kw);
  }
  
  // Generate queries from keywords
  const queries = [];
  for (const intent in byIntent) {
    for (const kw of byIntent[intent]) {
      queries.push({
        keyword: kw.original,
        query: generateQuery(kw.normalized, intent),
        intent: intent
      });
    }
  }
  
  return { processed, byIntent, queries };
}

// Helper function to normalize keywords
function normalizeKeyword(keyword) {
  return keyword.trim().toLowerCase();
}

// Helper function to detect keyword intent
function detectIntent(keyword) {
  // Pattern matching for intent detection
  if (/brand|company|who is|about/i.test(keyword)) return 'brand';
  if (/product|service|feature|how to use/i.test(keyword)) return 'product';
  if (/what is|definition|explain|guide/i.test(keyword)) return 'informational';
  
  return null; // Default to null, will use provided intent
}

// Helper function to generate natural language queries
function generateQuery(keyword, intent) {
  const templates = {
    brand: [
      `What can you tell me about ${keyword}?`,
      `Who is ${keyword} and what do they do?`,
      `What is ${keyword} known for?`
    ],
    product: [
      `What features does ${keyword} offer?`,
      `How does ${keyword} work?`,
      `What are the benefits of using ${keyword}?`
    ],
    informational: [
      `Explain ${keyword} in detail.`,
      `What is ${keyword}?`,
      `Tell me about ${keyword}.`
    ]
  };
  
  // Select random template for the intent
  const intentTemplates = templates[intent] || templates.informational;
  const randomIndex = Math.floor(Math.random() * intentTemplates.length);
  
  return intentTemplates[randomIndex];
}
```

## Database Schema

### Tables

- `clients`: Core client information
- `client_domains`: Additional domains owned by client
- `competitors`: Competitor information
- `keywords`: Keyword list for client
- `queries`: Generated natural language queries

### Key Relationships

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  industry TEXT,
  contact_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE client_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  domain TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  name TEXT,
  domain TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  keyword TEXT NOT NULL,
  intent TEXT,
  priority INTEGER DEFAULT 0,
  search_volume INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  keyword_id UUID REFERENCES keywords(id),
  query_text TEXT NOT NULL,
  intent TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Client Management

- `POST /api/clients`: Create new client profile
- `GET /api/clients`: List client profiles
- `GET /api/clients/{id}`: Get client details
- `PUT /api/clients/{id}`: Update client profile
- `DELETE /api/clients/{id}`: Delete client profile

### Competitor Management

- `GET /api/clients/{id}/competitors`: List client competitors
- `POST /api/clients/{id}/competitors`: Add competitor
- `PUT /api/clients/{id}/competitors/{competitorId}`: Update competitor
- `DELETE /api/clients/{id}/competitors/{competitorId}`: Remove competitor

### Keyword Management

- `POST /api/clients/{id}/keywords/import`: Import keywords
- `GET /api/clients/{id}/keywords`: List keywords
- `POST /api/clients/{id}/keywords/generate-queries`: Generate queries from keywords

## UI Components

- Client profile creation form
- Competitor management interface
- Keyword import and categorization tool
- Query preview and customization interface

## Validation Status

As outlined in the [First Validation Milestone](../../validation/first-milestone.md), the basic functionality for storing client profile information in Supabase has been implemented and validated.