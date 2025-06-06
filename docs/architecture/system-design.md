# System Design

## Overview

Citebots is designed as a cloud-native application with multi-tenant architecture capabilities. The system leverages modern serverless technologies and follows microservices principles for scalability and maintainability.

## Architecture Diagram

```
                                                             
                         Client Layer                        
                                                             $
  Vue.js/Nuxt.js Frontend (Netlify)                         
  - Theme Provider (Multi-tenant ready)                      
  - Role-based UI Components                                 
  - Tenant-aware Routing                                     
                                                             $
                          API Layer                          
                                                             $
  Netlify Functions (Serverless)                            
  - Tenant Context Middleware                               
  - Authentication/Authorization                            
  - Rate Limiting per Tenant                                
                                                             $
                        Service Layer                        
                                                             $
  Core Services                   External Services         
  - Client Management             - OpenAI API              
  - Analysis Engine               - Anthropic API           
  - Reporting Service             - Google Gemini API       
  - Recommendation Engine         - Perplexity API          
                                4                            $
                        Data Layer                           
                                                             $
  Supabase (PostgreSQL + Auth)                              
  - Row Level Security with tenant_id                       
  - Tenant-partitioned Tables                               
  - Edge Functions for Complex Operations                   
                                                             
```

## Multi-Tenant Architecture

### Tenant Isolation Strategy

1. **Database Level**
   - All tables include `tenant_id` column
   - Row Level Security policies enforce tenant isolation
   - Indexes optimized for tenant-based queries

2. **Application Level**
   - Tenant context injected at API gateway
   - Service methods require tenant_id parameter
   - No cross-tenant data access

3. **Infrastructure Level**
   - Tenant-specific rate limiting
   - Separate storage buckets per tenant (future)
   - Isolated compute resources for large tenants (future)

### Request Flow

1. Client makes request to API
2. API Gateway extracts tenant context from:
   - JWT token (contains tenant_id)
   - Subdomain (future: tenant.citebots.com)
   - Request header (for API clients)
3. Middleware validates tenant access
4. Service layer queries with tenant_id filter
5. Response filtered by tenant context

## Core Components

### 1. Authentication Service

```javascript
// Tenant-aware authentication
class AuthService {
  async authenticate(email, password, tenantId) {
    // Validate user belongs to tenant
    const user = await this.validateUserTenant(email, tenantId);
    
    // Standard authentication flow
    const { session, error } = await supabase.auth.signIn({
      email,
      password
    });
    
    // Inject tenant context into JWT
    return this.enrichSessionWithTenant(session, tenantId);
  }
}
```

### 2. Client Profile Service

```javascript
class ClientProfileService {
  async getClients(tenantId, userId) {
    // Check permissions for tenant
    if (!hasPermission(userId, tenantId, 'clients', 'read')) {
      throw new UnauthorizedError();
    }
    
    // Query with tenant filter
    const { data } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId);
    
    return data;
  }
}
```

### 3. Analysis Engine

```javascript
class AnalysisEngine {
  async runAnalysis(clientId, queries, tenantId) {
    // Validate client belongs to tenant
    await this.validateClientTenant(clientId, tenantId);
    
    // Get tenant-specific configuration
    const config = await this.getTenantConfig(tenantId);
    
    // Run analysis with tenant limits
    return this.executeQueries(queries, config.rateLimits);
  }
}
```

## Data Model

### Core Tables (with tenant_id)

```sql
-- Tenants table (future)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users with tenant association
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  CONSTRAINT unique_email_per_tenant UNIQUE(tenant_id, email)
);

-- Clients with tenant isolation
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_domain_per_tenant UNIQUE(tenant_id, domain)
);

-- All other tables include tenant_id similarly
```

### Row Level Security

```sql
-- Example RLS policy for clients table
CREATE POLICY tenant_isolation ON clients
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

## Security Architecture

### Authentication Flow

1. User provides credentials + tenant identifier
2. System validates user exists in tenant
3. JWT issued with tenant_id claim
4. All subsequent requests include tenant context

### Authorization Model

```javascript
const permissions = {
  admin: {
    clients: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete']
  },
  analyst: {
    clients: ['read', 'update'],
    reports: ['create', 'read', 'update'],
    users: ['read']
  },
  client: {
    clients: ['read'],
    reports: ['read'],
    users: []
  }
};

function canAccess(userRole, tenantId, resource, action) {
  // Check tenant membership first
  if (!isUserInTenant(userId, tenantId)) return false;
  
  // Then check role permissions
  return permissions[userRole]?.[resource]?.includes(action) || false;
}
```

## API Design

### RESTful Endpoints

All endpoints implicitly include tenant context:

```
GET    /api/v1/clients
POST   /api/v1/clients
GET    /api/v1/clients/:id
PUT    /api/v1/clients/:id
DELETE /api/v1/clients/:id

GET    /api/v1/analysis/runs
POST   /api/v1/analysis/runs
GET    /api/v1/analysis/runs/:id
```

Future multi-tenant explicit routes:
```
GET    /api/v1/tenants/:tenantId/clients
```

### Request/Response Format

```javascript
// Request headers include tenant context
{
  "Authorization": "Bearer <jwt-with-tenant-claim>",
  "X-Tenant-ID": "uuid" // Optional explicit tenant
}

// All responses scoped to tenant
{
  "data": [...], // Only tenant-specific data
  "meta": {
    "tenant": "tenant-uuid",
    "count": 42
  }
}
```

## Scalability Considerations

### Horizontal Scaling

- Stateless API layer scales automatically
- Database read replicas per tenant (future)
- Caching layer with tenant namespacing

### Performance Optimization

- Tenant-specific query optimization
- Indexed lookups on tenant_id
- Connection pooling per tenant
- Rate limiting by tenant tier

### Resource Quotas

```javascript
const tenantQuotas = {
  free: {
    maxClients: 5,
    maxQueries: 1000,
    maxUsers: 3
  },
  pro: {
    maxClients: 50,
    maxQueries: 10000,
    maxUsers: 10
  },
  enterprise: {
    maxClients: -1, // Unlimited
    maxQueries: -1,
    maxUsers: -1
  }
};
```

## Deployment Architecture

### Environment Separation

- Development: Single tenant for testing
- Staging: Multi-tenant simulation
- Production: Full multi-tenant with isolation

### Configuration Management

```javascript
// Environment-based configuration
const config = {
  development: {
    defaultTenantId: 'dev-tenant',
    enableMultiTenant: false
  },
  production: {
    defaultTenantId: null,
    enableMultiTenant: true
  }
};
```

## Monitoring and Observability

### Tenant-Aware Metrics

- Request rates per tenant
- Error rates by tenant
- Resource usage per tenant
- API latency by tenant tier

### Logging Strategy

```javascript
// All logs include tenant context
logger.info('Analysis completed', {
  tenantId,
  clientId,
  duration,
  queriesProcessed
});
```

## Future Enhancements

1. **Tenant Management UI**
   - Self-service tenant creation
   - Billing integration
   - Usage dashboards

2. **Advanced Isolation**
   - Separate databases per tenant
   - Dedicated compute resources
   - Geographic distribution

3. **White-Label Features**
   - Custom domains
   - Branded email templates
   - API white-labeling

4. **Enterprise Features**
   - SSO/SAML integration
   - Advanced audit logging
   - Compliance certifications