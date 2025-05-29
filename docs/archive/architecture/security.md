# Security Architecture

## Overview

Citebots implements a comprehensive security architecture with multi-tenant isolation at its core. The system ensures data privacy, secure access control, and protection against common vulnerabilities while maintaining flexibility for future white-label deployments.

## Core Security Principles

1. **Zero Trust Architecture**: Never trust, always verify
2. **Least Privilege Access**: Minimal permissions by default
3. **Defense in Depth**: Multiple layers of security
4. **Tenant Isolation**: Complete data separation between tenants
5. **Audit Everything**: Comprehensive logging and monitoring

## Authentication

### JWT-Based Authentication

All authentication uses JSON Web Tokens (JWT) with tenant context:

```javascript
// JWT Token Structure
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "email": "user@example.com",
  "role": "admin|analyst|client|guest",
  "permissions": ["clients:read", "reports:write"],
  "iat": 1642100000,
  "exp": 1642186400
}
```

### Authentication Flow

```javascript
// Login process with tenant validation
async function login(email, password, tenantId = null) {
  // 1. Validate credentials
  const { data: authUser, error } = await supabase.auth.signIn({
    email,
    password
  });
  
  if (error) throw new AuthenticationError('Invalid credentials');
  
  // 2. Verify tenant membership
  const { data: user } = await supabase
    .from('users')
    .select('*, user_roles(*)')
    .eq('id', authUser.id)
    .eq('tenant_id', tenantId || getDefaultTenantId())
    .single();
  
  if (!user) throw new UnauthorizedError('User not found in tenant');
  
  // 3. Generate JWT with tenant context
  const token = generateJWT({
    sub: user.id,
    tenant_id: user.tenant_id,
    email: user.email,
    role: user.user_roles[0].role,
    permissions: user.user_roles[0].permissions
  });
  
  return { user, token };
}
```

### Session Management

```javascript
// Session validation middleware
const validateSession = async (req, res, next) => {
  try {
    const token = extractToken(req);
    const payload = verifyJWT(token);
    
    // Verify tenant context
    if (!payload.tenant_id) {
      throw new UnauthorizedError('Missing tenant context');
    }
    
    // Verify user still exists and is active
    const user = await getUserById(payload.sub, payload.tenant_id);
    if (!user || !user.is_active) {
      throw new UnauthorizedError('Invalid session');
    }
    
    req.user = payload;
    req.tenantId = payload.tenant_id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

## Authorization

### Role-Based Access Control (RBAC)

Permissions are defined per role within tenant context:

```javascript
// Permission matrix
const rolePermissions = {
  admin: {
    clients: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update']
  },
  analyst: {
    clients: ['create', 'read', 'update'],
    reports: ['create', 'read', 'update'],
    users: ['read'],
    settings: ['read']
  },
  client: {
    clients: ['read'],
    reports: ['read'],
    users: [],
    settings: []
  },
  guest: {
    reports: ['read'],
    clients: [],
    users: [],
    settings: []
  }
};

// Permission check function
function hasPermission(user, resource, action) {
  const userPermissions = rolePermissions[user.role];
  return userPermissions?.[resource]?.includes(action) || false;
}
```

### Resource-Level Permissions

```javascript
// Check resource ownership within tenant
async function canAccessResource(userId, tenantId, resourceType, resourceId) {
  switch (resourceType) {
    case 'client':
      return await checkClientAccess(userId, tenantId, resourceId);
    case 'report':
      return await checkReportAccess(userId, tenantId, resourceId);
    case 'analysis':
      return await checkAnalysisAccess(userId, tenantId, resourceId);
    default:
      return false;
  }
}

// Example: Client access check
async function checkClientAccess(userId, tenantId, clientId) {
  const { data: client } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .eq('tenant_id', tenantId)
    .single();
  
  if (!client) return false;
  
  // Check if user has client-specific access
  const { data: access } = await supabase
    .from('client_users')
    .select('id')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .single();
  
  return !!access;
}
```

### Middleware Implementation

```javascript
// Authorization middleware
const authorize = (resource, action) => {
  return async (req, res, next) => {
    try {
      // Check role-based permissions
      if (!hasPermission(req.user, resource, action)) {
        throw new ForbiddenError('Insufficient permissions');
      }
      
      // Check resource-level access if needed
      if (req.params.id) {
        const canAccess = await canAccessResource(
          req.user.sub,
          req.tenantId,
          resource,
          req.params.id
        );
        
        if (!canAccess) {
          throw new ForbiddenError('Resource access denied');
        }
      }
      
      next();
    } catch (error) {
      res.status(403).json({ error: error.message });
    }
  };
};

// Usage in routes
app.get('/api/v1/clients/:id', 
  validateSession,
  authorize('clients', 'read'),
  getClient
);
```

## Data Security

### Database-Level Security

#### Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policy
CREATE POLICY tenant_isolation ON clients
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- User-specific access policy
CREATE POLICY user_access ON clients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM client_users
      WHERE client_users.client_id = clients.id
      AND client_users.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role IN ('admin', 'analyst')
      AND user_roles.tenant_id = clients.tenant_id
    )
  );
```

### Encryption

#### Data at Rest

- Database encryption using AES-256
- File storage encryption for uploads
- Backup encryption with separate keys

#### Data in Transit

- TLS 1.3 for all API communications
- Certificate pinning for mobile apps (future)
- Encrypted webhooks with HMAC signatures

### API Security

#### Rate Limiting

```javascript
// Tenant-aware rate limiting
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (req) => `${req.tenantId}:${req.ip}`,
  skip: (req) => req.user.role === 'admin',
  limits: {
    free: 100,
    pro: 1000,
    enterprise: 10000
  },
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: req.rateLimit.resetTime
    });
  }
};
```

#### Input Validation

```javascript
// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details
      });
    }
    next();
  };
};

// Schema example
const createClientSchema = Joi.object({
  name: Joi.string().required().max(255),
  domain: Joi.string().domain().required(),
  industry: Joi.string().valid(...allowedIndustries),
  contact_email: Joi.string().email()
});
```

#### CORS Configuration

```javascript
const corsOptions = {
  origin: (origin, callback) => {
    // Allow tenant-specific domains
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID']
};
```

## Infrastructure Security

### Environment Variables

```javascript
// Secure configuration management
const config = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  database: {
    url: process.env.DATABASE_URL,
    sslMode: process.env.DB_SSL_MODE || 'require'
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    algorithm: 'aes-256-gcm'
  }
};

// Validate required secrets
const requiredSecrets = ['JWT_SECRET', 'DATABASE_URL', 'ENCRYPTION_KEY'];
requiredSecrets.forEach(secret => {
  if (!process.env[secret]) {
    throw new Error(`Missing required secret: ${secret}`);
  }
});
```

### Secrets Management

- Use environment variables for configuration
- Rotate secrets regularly
- Never commit secrets to version control
- Use separate secrets per environment

### Network Security

- VPC isolation for database
- Private subnets for internal services
- IP whitelisting for admin access
- DDoS protection at CDN level

## Audit and Compliance

### Audit Logging

```javascript
// Comprehensive audit logging
class AuditLogger {
  async log(event) {
    const auditEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      tenant_id: event.tenantId,
      user_id: event.userId,
      action: event.action,
      resource_type: event.resourceType,
      resource_id: event.resourceId,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      result: event.result,
      error: event.error,
      metadata: event.metadata
    };
    
    await supabase
      .from('audit_logs')
      .insert(auditEntry);
  }
}

// Usage in API endpoints
app.post('/api/v1/clients', async (req, res) => {
  try {
    const client = await createClient(req.body);
    
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.sub,
      action: 'CREATE',
      resourceType: 'client',
      resourceId: client.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      result: 'SUCCESS'
    });
    
    res.json({ success: true, data: client });
  } catch (error) {
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.sub,
      action: 'CREATE',
      resourceType: 'client',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      result: 'FAILURE',
      error: error.message
    });
    
    res.status(400).json({ error: error.message });
  }
});
```

### Compliance Features

- GDPR data export/deletion
- SOC 2 audit trail
- HIPAA compliance ready (future)
- PCI DSS for payment processing (future)

## Security Monitoring

### Real-time Alerts

```javascript
// Security event monitoring
const securityMonitor = {
  async checkSuspiciousActivity(userId, tenantId) {
    const recentFailures = await getRecentLoginFailures(userId);
    if (recentFailures > 5) {
      await notifySecurityTeam({
        alert: 'Multiple login failures',
        userId,
        tenantId,
        failures: recentFailures
      });
    }
  },
  
  async detectAnomalies(req) {
    // Check for unusual patterns
    const isAnomaly = await mlModel.detectAnomaly({
      userId: req.user.sub,
      endpoint: req.path,
      timestamp: new Date(),
      location: req.ip
    });
    
    if (isAnomaly) {
      await flagForReview(req);
    }
  }
};
```

### Security Metrics

- Failed login attempts by tenant
- API abuse patterns
- Data access anomalies
- Permission escalation attempts

## Incident Response

### Security Incident Procedures

1. **Detection**: Automated monitoring and alerts
2. **Assessment**: Evaluate severity and scope
3. **Containment**: Isolate affected systems
4. **Eradication**: Remove threat
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Post-incident review

### Data Breach Protocol

```javascript
// Automated breach response
async function handleDataBreach(incident) {
  // 1. Isolate affected tenant
  await isolateTenant(incident.tenantId);
  
  // 2. Notify stakeholders
  await notifyAffectedUsers(incident);
  await notifyRegulators(incident);
  
  // 3. Preserve evidence
  await captureForensicData(incident);
  
  // 4. Begin remediation
  await startRemediation(incident);
}
```

## Security Best Practices

### For Developers

1. Never hardcode secrets
2. Always validate input
3. Use parameterized queries
4. Implement proper error handling
5. Follow secure coding guidelines

### For Operations

1. Regular security updates
2. Penetration testing
3. Security awareness training
4. Incident response drills
5. Third-party security audits

### For Users

1. Strong password requirements
2. Multi-factor authentication (future)
3. Regular access reviews
4. Security training materials
5. Suspicious activity reporting

## Future Security Enhancements

1. **Advanced Authentication**
   - Multi-factor authentication
   - Biometric authentication
   - Hardware security keys

2. **Enhanced Monitoring**
   - Machine learning anomaly detection
   - Behavioral analytics
   - Real-time threat intelligence

3. **Zero Trust Network**
   - Microsegmentation
   - Software-defined perimeter
   - Continuous verification

4. **Compliance Automation**
   - Automated compliance reporting
   - Policy enforcement
   - Continuous compliance monitoring