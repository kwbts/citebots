# Data Model

## Overview

The Citebots data model is designed with multi-tenancy in mind. All tables include tenant isolation to support future white-label deployments while maintaining data security and performance.

## Core Design Principles

1. **Tenant Isolation**: Every table includes `tenant_id` for data partitioning
2. **Referential Integrity**: Foreign key constraints maintain data consistency
3. **Audit Trail**: Timestamps track creation and modification
4. **Scalability**: Indexes optimized for common query patterns
5. **Flexibility**: JSONB columns for extensible data

## Entity Relationship Diagram

```
              
   tenants     (future)
      ,       
       
        1:n
       
      4                           
    users         $ user_roles    
      ,                           
       
        1:n
       
      4                                               
   clients        $ competitors        client_domains 
      ,                                               
       
        1:n
       
      4                           
   keywords       $    queries    
                         ,        
                            
                             1:n
                            
                           4                            
                    analysis_runs       $  responses    
                                               ,        
                                                  
                                                   1:n
                                                  
                                                 4        
                                             citations    
                                                          
```

## Table Definitions

### Core Tables

#### tenants (future implementation)
```sql
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  config JSONB DEFAULT '{}',
  subscription_tier TEXT DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_domain ON tenants(domain);
```

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email)
);

-- Indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
```

#### user_roles
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'partner', 'analyst', 'client', 'guest')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_role_per_tenant UNIQUE(tenant_id, user_id, role)
);

-- Indexes
CREATE INDEX idx_user_roles_tenant_id ON user_roles(tenant_id);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
```

#### partner_relationships
```sql
CREATE TABLE partner_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_partner_per_tenant UNIQUE(tenant_id, partner_id),
  CONSTRAINT partner_must_have_partner_role CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = partner_id
      AND user_roles.role = 'partner'
    )
  )
);

-- Indexes
CREATE INDEX idx_partner_relationships_tenant_id ON partner_relationships(tenant_id);
CREATE INDEX idx_partner_relationships_partner_id ON partner_relationships(partner_id);
```

#### partner_clients
```sql
CREATE TABLE partner_clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT unique_partner_client UNIQUE(tenant_id, partner_id, client_id)
);

-- Indexes
CREATE INDEX idx_partner_clients_tenant_id ON partner_clients(tenant_id);
CREATE INDEX idx_partner_clients_partner_id ON partner_clients(partner_id);
CREATE INDEX idx_partner_clients_client_id ON partner_clients(client_id);
```

### Client Management

#### clients
```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  primary_domain TEXT NOT NULL,
  industry TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_domain_per_tenant UNIQUE(tenant_id, primary_domain)
);

-- Indexes
CREATE INDEX idx_clients_tenant_id ON clients(tenant_id);
CREATE INDEX idx_clients_primary_domain ON clients(primary_domain);
```

#### client_domains
```sql
CREATE TABLE client_domains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_client_domain_per_tenant UNIQUE(tenant_id, client_id, domain)
);

-- Indexes
CREATE INDEX idx_client_domains_tenant_id ON client_domains(tenant_id);
CREATE INDEX idx_client_domains_client_id ON client_domains(client_id);
```

#### competitors
```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_competitor_per_client UNIQUE(tenant_id, client_id, domain)
);

-- Indexes
CREATE INDEX idx_competitors_tenant_id ON competitors(tenant_id);
CREATE INDEX idx_competitors_client_id ON competitors(client_id);
```

### Query Management

#### keywords
```sql
CREATE TABLE keywords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  intent TEXT CHECK (intent IN ('brand', 'product', 'informational')),
  priority INTEGER DEFAULT 0,
  search_volume INTEGER,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_keyword_per_client UNIQUE(tenant_id, client_id, keyword)
);

-- Indexes
CREATE INDEX idx_keywords_tenant_id ON keywords(tenant_id);
CREATE INDEX idx_keywords_client_id ON keywords(client_id);
CREATE INDEX idx_keywords_intent ON keywords(intent);
```

#### queries
```sql
CREATE TABLE queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  intent TEXT NOT NULL,
  parameters JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_queries_tenant_id ON queries(tenant_id);
CREATE INDEX idx_queries_keyword_id ON queries(keyword_id);
```

### Analysis System

#### analysis_runs
```sql
CREATE TABLE analysis_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  config JSONB DEFAULT '{}',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  total_queries INTEGER NOT NULL DEFAULT 0,
  completed_queries INTEGER NOT NULL DEFAULT 0,
  failed_queries INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analysis_runs_tenant_id ON analysis_runs(tenant_id);
CREATE INDEX idx_analysis_runs_client_id ON analysis_runs(client_id);
CREATE INDEX idx_analysis_runs_status ON analysis_runs(status);
```

#### responses
```sql
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  analysis_run_id UUID REFERENCES analysis_runs(id) ON DELETE CASCADE,
  query_id UUID REFERENCES queries(id) ON DELETE CASCADE,
  llm_service TEXT NOT NULL,
  raw_response TEXT NOT NULL,
  processed_response JSONB,
  tokens_used INTEGER,
  latency_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_responses_tenant_id ON responses(tenant_id);
CREATE INDEX idx_responses_analysis_run_id ON responses(analysis_run_id);
CREATE INDEX idx_responses_query_id ON responses(query_id);
```

#### citations
```sql
CREATE TABLE citations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  response_id UUID REFERENCES responses(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  title TEXT,
  snippet TEXT,
  context TEXT,
  position INTEGER,
  is_client_domain BOOLEAN DEFAULT false,
  is_competitor_domain BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_citations_tenant_id ON citations(tenant_id);
CREATE INDEX idx_citations_response_id ON citations(response_id);
CREATE INDEX idx_citations_domain ON citations(domain);
CREATE INDEX idx_citations_is_client_domain ON citations(is_client_domain);
CREATE INDEX idx_citations_is_competitor_domain ON citations(is_competitor_domain);
```

### Reporting System

#### reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  analysis_run_id UUID REFERENCES analysis_runs(id),
  type TEXT NOT NULL CHECK (type IN ('brand', 'product', 'informational', 'custom')),
  name TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  data JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_tenant_id ON reports(tenant_id);
CREATE INDEX idx_reports_client_id ON reports(client_id);
CREATE INDEX idx_reports_type ON reports(type);
```

#### recommendations
```sql
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  analysis_run_id UUID REFERENCES analysis_runs(id),
  type TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_items JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recommendations_tenant_id ON recommendations(tenant_id);
CREATE INDEX idx_recommendations_client_id ON recommendations(client_id);
CREATE INDEX idx_recommendations_priority ON recommendations(priority);
```

## Row Level Security

All tables implement RLS policies for tenant isolation:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ... (for all tables)

-- Example policy for clients table
CREATE POLICY tenant_isolation ON clients
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Admin bypass policy (optional)
CREATE POLICY admin_bypass ON clients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
      AND tenant_id = clients.tenant_id
    )
  );
```

## Data Integrity Constraints

### Foreign Key Relationships

- All child tables reference parent tables with CASCADE DELETE
- Tenant consistency enforced through compound unique constraints
- Circular dependencies avoided through careful design

### Check Constraints

- Enum values enforced for status fields
- Email format validation
- URL format validation for domains

### Triggers

```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## Performance Considerations

### Indexing Strategy

1. **Primary Keys**: UUID for all tables
2. **Foreign Keys**: Indexed for join performance
3. **Tenant Filtering**: tenant_id indexed on all tables
4. **Common Queries**: Composite indexes for frequent patterns

### Partitioning Strategy (Future)

```sql
-- Partition large tables by tenant_id
CREATE TABLE citations_partitioned (
  LIKE citations INCLUDING ALL
) PARTITION BY HASH (tenant_id);

-- Create partitions
CREATE TABLE citations_partition_0 PARTITION OF citations_partitioned
  FOR VALUES WITH (modulus 4, remainder 0);
```

## Migration Strategy

### Initial Schema (MVP)

1. Create all tables with tenant_id column
2. Use single default tenant_id for all data
3. Implement basic RLS policies

### Multi-Tenant Migration

1. Create tenants table
2. Migrate existing data to appropriate tenants
3. Update RLS policies for full isolation
4. Implement tenant-specific partitioning

## Data Retention

### Archival Strategy

```sql
-- Archive old analysis data
CREATE TABLE analysis_runs_archive (
  LIKE analysis_runs INCLUDING ALL
);

-- Move old data
INSERT INTO analysis_runs_archive
SELECT * FROM analysis_runs
WHERE completed_at < NOW() - INTERVAL '1 year';
```

### Cleanup Policies

- Analysis data: Archive after 1 year
- User activity logs: Retain for 90 days
- Temporary data: Clean up after 24 hours

## Backup and Recovery

### Backup Strategy

- Full database backup: Daily
- Incremental backup: Every 4 hours
- Point-in-time recovery: 7-day window
- Tenant-specific exports: On demand