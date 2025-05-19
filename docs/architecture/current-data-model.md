# Current Data Model - Citebots

## Overview

The Citebots database is built on Supabase (PostgreSQL) with Row Level Security (RLS) enabled for all tables. This document describes the actual production database schema.

## Core Tables

### 1. profiles

User profiles linked to Supabase Auth.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  role TEXT CHECK (role IN ('super_admin', 'partner', 'client', 'analyst')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
- Primary key on `id`
- Unique constraint on `email`

**RLS Policies**:
- Users can read their own profile
- Service role has full access

### 2. access_requests

Stores user access requests for provisioning.

```sql
CREATE TABLE access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  generated_password TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3. clients

Client organizations using the system.

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL UNIQUE,
  description TEXT,
  industry TEXT,
  target_audience TEXT,
  keywords TEXT[], -- Array of keywords
  suggested_keywords TEXT[], -- AI-suggested keywords
  business_description TEXT, -- AI-generated description
  created_by UUID REFERENCES profiles(id), -- Some tables use this
  user_id UUID REFERENCES profiles(id),    -- Some tables use this
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important Note**: Client ownership is tracked by either `created_by` or `user_id` columns. Edge functions should check both.

**Indexes**:
- Unique constraints on `name` and `domain`
- Foreign key indexes

### 4. competitors

Competitor information for each client (separate table, not JSON column).

```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Indexes**:
- Foreign key on `client_id`
- Unique constraint on `(client_id, domain)`

### 5. analysis_runs

Analysis batch runs for clients.

```sql
CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  batch_id TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  platform TEXT NOT NULL, -- chatgpt, perplexity, both
  intents TEXT[] DEFAULT ARRAY[]::TEXT[],
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  queries_total INTEGER DEFAULT 0,
  queries_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);
```

**Indexes**:
- Foreign key on `client_id`
- Index on `status`

### 6. analysis_queries

Individual queries within analysis runs.

```sql
CREATE TABLE analysis_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_run_id UUID REFERENCES analysis_runs(id) ON DELETE CASCADE,
  query_id TEXT UNIQUE NOT NULL,
  query_text TEXT NOT NULL,
  query_keyword TEXT,
  query_category TEXT,
  query_topic TEXT,
  query_type TEXT,
  query_intent TEXT,
  funnel_stage TEXT,
  query_complexity TEXT,
  data_source TEXT NOT NULL, -- chatgpt, perplexity
  model_response TEXT,
  citation_count INTEGER DEFAULT 0,
  brand_mentioned BOOLEAN DEFAULT FALSE,
  brand_sentiment FLOAT,
  competitor_mentioned_names TEXT[] DEFAULT ARRAY[]::TEXT[],
  competitor_count INTEGER DEFAULT 0,
  associated_pages_count INTEGER DEFAULT 0,
  response_match TEXT,
  response_outcome TEXT,
  brand_mention_type TEXT,
  competitor_context TEXT,
  action_orientation TEXT,
  query_competition TEXT,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  error_message TEXT
);
```

**Indexes**:
- Foreign key on `analysis_run_id`
- Unique constraint on `query_id`
- Index on `status`

### 7. page_analyses

Analysis results for individual web pages.

```sql
CREATE TABLE page_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_id UUID REFERENCES analysis_queries(id) ON DELETE CASCADE,
  page_analysis_id TEXT NOT NULL,
  citation_url TEXT NOT NULL,
  citation_position INTEGER,
  domain_name TEXT,
  is_client_domain BOOLEAN DEFAULT FALSE,
  is_competitor_domain BOOLEAN DEFAULT FALSE,
  mention_type TEXT[] DEFAULT ARRAY[]::TEXT[],
  analysis_notes TEXT,
  
  -- JSONB fields for detailed metrics
  technical_seo JSONB DEFAULT '{}'::JSONB,
  page_performance JSONB DEFAULT '{}'::JSONB,
  domain_authority JSONB DEFAULT '{}'::JSONB,
  on_page_seo JSONB DEFAULT '{}'::JSONB,
  content_quality JSONB DEFAULT '{}'::JSONB,
  page_analysis JSONB DEFAULT '{}'::JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**JSONB Field Structures**:

```javascript
technical_seo: {
  meta_title: string,
  meta_description: string,
  h1_tags: string[],
  structured_data: boolean,
  canonical_url: string,
  robots_meta: string
}

page_performance: {
  load_time: number,
  page_size: number,
  mobile_friendly: boolean,
  core_web_vitals: object
}

domain_authority: {
  domain_rank: number,
  backlinks: number,
  referring_domains: number,
  organic_keywords: number
}

content_quality: {
  word_count: number,
  readability_score: number,
  keyword_density: object,
  content_type: string,
  e_e_a_t_signals: object
}
```

### 8. benchmark_data

Anonymized data for industry benchmarking.

```sql
CREATE TABLE benchmark_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_date DATE NOT NULL,
  industry_sector TEXT,
  query_keyword TEXT,
  query_category TEXT,
  query_topic TEXT,
  query_type TEXT,
  funnel_stage TEXT,
  data_source TEXT NOT NULL,
  citation_count INTEGER,
  response_match TEXT,
  response_outcome TEXT,
  action_orientation TEXT,
  query_competition TEXT,
  
  -- Aggregated metrics
  avg_citation_position FLOAT,
  domain_authority_stats JSONB,
  content_quality_metrics JSONB,
  technical_seo_metrics JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policy patterns:

### For User-Owned Resources (clients, analysis_runs)
```sql
-- Read access
CREATE POLICY "Users can view their own resources"
  ON table_name
  FOR SELECT
  USING (
    user_id = auth.uid() OR created_by = auth.uid()
  );

-- Write access for super admins
CREATE POLICY "Super admins can manage all resources"
  ON table_name
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'super_admin'
    )
  );
```

### For Service Role Operations
```sql
CREATE POLICY "Service role has full access"
  ON table_name
  FOR ALL
  USING (auth.role() = 'service_role');
```

## Relationships

```
profiles
  └─→ clients (via user_id or created_by)
       ├─→ competitors (1:n)
       └─→ analysis_runs (1:n)
            └─→ analysis_queries (1:n)
                 └─→ page_analyses (1:n)
```

## Data Integrity

### Foreign Key Constraints
- All child tables use `ON DELETE CASCADE`
- Prevents orphaned records

### Check Constraints
- Role validation in profiles table
- Status enums in analysis tables

### Unique Constraints
- Email uniqueness in profiles
- Domain uniqueness per client
- Query ID uniqueness

## Performance Considerations

### Indexes
- Primary keys: All tables use UUID primary keys
- Foreign keys: Indexed for join performance
- Status fields: Indexed for filtering
- Unique fields: Automatically indexed

### JSONB Usage
- Used for flexible, schema-less data
- Allows for future expansion
- Indexed using GIN for query performance

## Migration Notes

When updating the schema:

1. Create migration files in `/scripts/`
2. Test on development database first
3. Apply using Supabase dashboard
4. Update RLS policies if needed
5. Document changes in changelog

## Best Practices

1. **Always use UUIDs** for primary keys
2. **Enable RLS** on all new tables
3. **Add timestamps** (created_at, updated_at)
4. **Use JSONB** for flexible data structures
5. **Create indexes** for frequently queried fields
6. **Document JSONB structures** in comments
7. **Test RLS policies** thoroughly