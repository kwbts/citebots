# Multi-Tenant Architecture Philosophy

## Overview

Citebots is being architected with future multi-tenant white-labeling capabilities in mind. While the MVP is a single-tenant application for internal use, all architectural decisions are made to support seamless transition to multi-tenancy without requiring major rewrites.

## Current State (MVP)

- Single-tenant application
- Admin-only access
- Foundation for multi-tenant expansion

## Architectural Principles

### 1. Database Design

All tables include tenant context:

```sql
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  -- other fields...
  CONSTRAINT unique_client_per_tenant UNIQUE(tenant_id, domain)
);
```

For MVP:
- All records use a single `tenant_id` (admin tenant)
- Database structure ready for multi-tenant data isolation

### 2. API Architecture

#### Route Structure
```javascript
// Current (implicit tenant from session)
/api/v1/clients

// Future (explicit tenant routing)
/api/v1/{tenant}/clients
```

#### Request Context
```javascript
const getTenantContext = (req) => {
  // MVP: Always returns admin tenant
  return {
    id: process.env.ADMIN_TENANT_ID || 'default-tenant',
    name: 'Citebots Admin'
  };
  
  // Future: Extract from subdomain, JWT, or route
};
```

### 3. Service Layer

All service methods accept tenant context:

```javascript
class ClientService {
  async getClients(tenantId) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantId);
    
    return data;
  }
}
```

### 4. Authentication & Authorization

#### Permission Model
```javascript
const hasPermission = (userId, tenantId, resource, action) => {
  // MVP: Simple role-based check
  const userRole = getUserRole(userId);
  
  if (userRole === 'admin') return true;
  if (userRole === 'client' && action === 'read') {
    return ['reports', 'dashboard'].includes(resource);
  }
  
  return false;
};
```

#### Roles Structure
- **Admin**: Full system access
- **Client**: Read-only access to specific resources
- Future: Tenant-specific role assignments

### 5. UI Architecture

#### Theme Provider Pattern
```javascript
const ThemeProvider = ({ children }) => {
  const theme = getThemeForTenant(); // MVP: default theme
  
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};
```

#### Component Design
- Accept styling props for customization
- No hardcoded colors or branding
- Configurable logos and assets

### 6. Configuration Management

```javascript
class ConfigService {
  getConfig(tenantId) {
    // MVP: Return default configuration
    return {
      brandName: 'Citebots',
      primaryColor: '#1a73e8',
      features: {
        aiRecommendations: true,
        customReports: true
      }
    };
    
    // Future: Tenant-specific configurations
  }
}
```

## Implementation Checklist

### Phase 1 (MVP) - Current
- [x] Single tenant with admin access
- [x] Database schema includes tenant_id
- [x] API structure supports tenant context
- [x] Component architecture supports theming
- [x] Permission system foundation

### Phase 2 (Post-MVP) - Future
- [ ] Tenant management UI
- [ ] Custom branding interface
- [ ] Tenant onboarding flow
- [ ] Subdomain or path-based routing
- [ ] Per-tenant billing integration
- [ ] White-label email templates
- [ ] Custom feature toggles per tenant

## Code Patterns

### Database Queries
```javascript
// Always include tenant_id in queries
const getAnalysisResults = async (clientId, tenantId) => {
  const { data } = await supabase
    .from('analysis_results')
    .select('*')
    .eq('client_id', clientId)
    .eq('tenant_id', tenantId);
  
  return data;
};
```

### API Endpoints
```javascript
// Tenant context in all endpoints
app.get('/api/v1/clients', async (req, res) => {
  const { tenantId } = getTenantContext(req);
  const clients = await clientService.getClients(tenantId);
  res.json(clients);
});
```

### Component Props
```javascript
// Components accept customization
const DashboardHeader = ({ 
  title = 'Analytics Dashboard',
  logoUrl,
  primaryColor,
  ...props 
}) => {
  return (
    <header style={{ backgroundColor: primaryColor || '#1a73e8' }}>
      <img src={logoUrl || '/default-logo.png'} alt="Logo" />
      <h1>{title}</h1>
    </header>
  );
};
```

## Migration Strategy

When transitioning to multi-tenant:

1. **Database Migration**
   - Add tenant management tables
   - Update existing records with appropriate tenant_ids
   - Add tenant-specific indexes

2. **API Updates**
   - Implement tenant extraction from requests
   - Add tenant validation middleware
   - Update route patterns if needed

3. **UI Customization**
   - Implement theme selection UI
   - Add branding configuration options
   - Enable feature toggle management

4. **Authentication Enhancement**
   - Add tenant selection/switching
   - Implement cross-tenant access controls
   - Add tenant-specific session management

## Security Considerations

- Data isolation between tenants
- Tenant-specific API rate limiting
- Audit logging with tenant context
- Secure tenant identifier handling
- Cross-tenant access prevention

## Performance Optimization

- Tenant-specific caching strategies
- Database partitioning by tenant_id
- CDN configuration per tenant
- Resource quotas per tenant