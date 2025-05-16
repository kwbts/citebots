# API Endpoints

## Overview

All Citebots API endpoints are designed with multi-tenant architecture in mind. While the MVP implementation uses implicit tenant context from the authenticated session, the structure supports future explicit tenant routing.

## Base URL Structure

### Current (MVP)
```
https://citebots.com/api/v1/{resource}
```

### Future (Multi-tenant)
```
https://citebots.com/api/v1/{resource}
https://{tenant}.citebots.com/api/v1/{resource}
https://citebots.com/api/v1/tenants/{tenant-id}/{resource}
```

## Authentication

All endpoints require authentication via JWT token containing tenant context:

```bash
curl -H "Authorization: Bearer {jwt-token}" \
     -H "Content-Type: application/json" \
     https://citebots.com/api/v1/clients
```

### JWT Token Structure
```json
{
  "sub": "user-uuid",
  "tenant_id": "tenant-uuid",
  "role": "admin|analyst|client",
  "exp": 1234567890
}
```

## Common Headers

```
Authorization: Bearer {jwt-token}
Content-Type: application/json
X-Tenant-ID: {tenant-uuid} (optional, for explicit tenant context)
X-Request-ID: {request-uuid} (for tracing)
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "tenant_id": "tenant-uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "request-uuid"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found",
    "details": { ... }
  },
  "meta": {
    "tenant_id": "tenant-uuid",
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "request-uuid"
  }
}
```

## Endpoint Documentation

### Authentication Endpoints

#### Login
```
POST /api/v1/auth/login
```

Request:
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "tenant_id": "tenant-uuid" // Optional for MVP
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "role": "admin",
      "tenant_id": "tenant-uuid"
    },
    "token": "jwt-token",
    "expires_at": "2024-01-16T10:30:00Z"
  }
}
```

#### Refresh Token
```
POST /api/v1/auth/refresh
```

#### Logout
```
POST /api/v1/auth/logout
```

### User Management

#### List Users
```
GET /api/v1/users
```

Query Parameters:
- `role`: Filter by role (admin|analyst|client)
- `is_active`: Filter by active status
- `limit`: Number of results (default: 20)
- `offset`: Pagination offset

Response:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user-uuid",
        "email": "user@example.com",
        "full_name": "John Doe",
        "role": "analyst",
        "tenant_id": "tenant-uuid",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 42
  }
}
```

#### Create User
```
POST /api/v1/users
```

Request:
```json
{
  "email": "newuser@example.com",
  "full_name": "Jane Smith",
  "role": "analyst",
  "send_invitation": true
}
```

#### Get User
```
GET /api/v1/users/{user-id}
```

#### Update User
```
PUT /api/v1/users/{user-id}
```

#### Delete User
```
DELETE /api/v1/users/{user-id}
```

### Client Management

#### List Clients
```
GET /api/v1/clients
```

Implementation Note:
```javascript
// Tenant context is extracted from JWT
const getTenantId = (req) => {
  return req.user.tenant_id || process.env.DEFAULT_TENANT_ID;
};

// Query includes tenant filter
const clients = await db.clients
  .where('tenant_id', getTenantId(req))
  .select();
```

Query Parameters:
- `is_active`: Filter by active status
- `industry`: Filter by industry
- `search`: Search by name or domain

Response:
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "client-uuid",
        "name": "Acme Corp",
        "primary_domain": "acme.com",
        "industry": "Technology",
        "tenant_id": "tenant-uuid",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 10
  }
}
```

#### Create Client
```
POST /api/v1/clients
```

Request:
```json
{
  "name": "New Client",
  "primary_domain": "newclient.com",
  "industry": "E-commerce",
  "contact_email": "contact@newclient.com"
}
```

Implementation Note:
```javascript
// Tenant ID is automatically added
const newClient = await db.clients.create({
  ...req.body,
  tenant_id: getTenantId(req)
});
```

#### Get Client
```
GET /api/v1/clients/{client-id}
```

#### Update Client
```
PUT /api/v1/clients/{client-id}
```

#### Delete Client
```
DELETE /api/v1/clients/{client-id}
```

### Competitor Management

#### List Competitors
```
GET /api/v1/clients/{client-id}/competitors
```

#### Add Competitor
```
POST /api/v1/clients/{client-id}/competitors
```

Request:
```json
{
  "name": "Competitor Inc",
  "domain": "competitor.com",
  "description": "Primary competitor in region"
}
```

#### Update Competitor
```
PUT /api/v1/clients/{client-id}/competitors/{competitor-id}
```

#### Remove Competitor
```
DELETE /api/v1/clients/{client-id}/competitors/{competitor-id}
```

### Keyword Management

#### Import Keywords
```
POST /api/v1/clients/{client-id}/keywords/import
```

Request:
```json
{
  "keywords": ["keyword1", "keyword2"],
  "intent": "brand",
  "format": "plain" // or "csv"
}
```

#### List Keywords
```
GET /api/v1/clients/{client-id}/keywords
```

Query Parameters:
- `intent`: Filter by intent type
- `priority`: Filter by priority level

#### Generate Queries
```
POST /api/v1/clients/{client-id}/keywords/generate-queries
```

Request:
```json
{
  "keyword_ids": ["keyword-uuid-1", "keyword-uuid-2"],
  "templates": ["default", "conversational"]
}
```

### Analysis Engine

#### Start Analysis
```
POST /api/v1/analysis/runs
```

Request:
```json
{
  "client_id": "client-uuid",
  "query_ids": ["query-uuid-1", "query-uuid-2"],
  "llm_services": ["openai", "anthropic"],
  "config": {
    "batch_size": 10,
    "timeout": 30000
  }
}
```

Implementation Note:
```javascript
// Validate client belongs to tenant
const client = await db.clients
  .where('id', req.body.client_id)
  .where('tenant_id', getTenantId(req))
  .first();

if (!client) {
  throw new UnauthorizedError('Client not found in tenant');
}
```

#### Get Analysis Status
```
GET /api/v1/analysis/runs/{run-id}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "run-uuid",
    "status": "running",
    "progress": {
      "total": 100,
      "completed": 45,
      "failed": 2
    },
    "estimated_completion": "2024-01-15T11:00:00Z"
  }
}
```

#### Pause Analysis
```
PUT /api/v1/analysis/runs/{run-id}/pause
```

#### Resume Analysis
```
PUT /api/v1/analysis/runs/{run-id}/resume
```

#### Cancel Analysis
```
DELETE /api/v1/analysis/runs/{run-id}
```

### Reporting

#### Generate Report
```
POST /api/v1/reports
```

Request:
```json
{
  "client_id": "client-uuid",
  "analysis_run_id": "run-uuid",
  "type": "brand",
  "config": {
    "include_competitors": true,
    "date_range": "last_30_days"
  }
}
```

#### List Reports
```
GET /api/v1/reports
```

Query Parameters:
- `client_id`: Filter by client
- `type`: Filter by report type
- `created_after`: Filter by creation date

#### Get Report
```
GET /api/v1/reports/{report-id}
```

#### Export Report
```
GET /api/v1/reports/{report-id}/export/{format}
```

Supported formats: `pdf`, `excel`, `csv`

#### Share Report
```
POST /api/v1/reports/{report-id}/share
```

Request:
```json
{
  "expires_in_days": 7,
  "allow_download": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "share_url": "https://citebots.com/shared/abc123",
    "expires_at": "2024-01-22T10:30:00Z"
  }
}
```

### Recommendations

#### Generate Recommendations
```
POST /api/v1/recommendations/generate
```

Request:
```json
{
  "client_id": "client-uuid",
  "analysis_run_id": "run-uuid",
  "types": ["content_gaps", "technical_seo"]
}
```

#### Get Recommendations
```
GET /api/v1/recommendations/{client-id}
```

Query Parameters:
- `type`: Filter by recommendation type
- `priority`: Filter by priority level
- `status`: Filter by status

### Dashboard

#### Get Dashboard Data
```
GET /api/v1/dashboard/{client-id}
```

Response:
```json
{
  "success": true,
  "data": {
    "overview": {
      "total_citations": 542,
      "client_citations": 234,
      "competitor_citations": 308,
      "citation_growth": 12.5
    },
    "by_intent": {
      "brand": 180,
      "product": 220,
      "informational": 142
    },
    "recent_analyses": [ ... ],
    "top_cited_pages": [ ... ]
  }
}
```

## Rate Limiting

Rate limits are applied per tenant:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1642250000
```

### Limits by Endpoint

| Endpoint Pattern | Free Tier | Pro Tier | Enterprise |
|-----------------|-----------|----------|------------|
| `/api/v1/auth/*` | 10/min | 20/min | 50/min |
| `/api/v1/analysis/*` | 100/hour | 500/hour | Unlimited |
| `/api/v1/reports/*` | 50/hour | 200/hour | Unlimited |
| Other endpoints | 1000/hour | 5000/hour | Unlimited |

## Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Invalid or missing authentication |
| `FORBIDDEN` | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | Resource doesn't exist in tenant |
| `VALIDATION_ERROR` | Invalid request parameters |
| `RATE_LIMITED` | Too many requests |
| `TENANT_QUOTA_EXCEEDED` | Tenant limit reached |
| `SERVER_ERROR` | Internal server error |

## Webhook Endpoints (Future)

### Register Webhook
```
POST /api/v1/webhooks
```

Request:
```json
{
  "url": "https://example.com/webhook",
  "events": ["analysis.completed", "report.generated"],
  "secret": "webhook-secret"
}
```

### Update Webhook
```
PUT /api/v1/webhooks/{webhook-id}
```

### Delete Webhook
```
DELETE /api/v1/webhooks/{webhook-id}
```

## SDK Support

Future SDK implementations will automatically handle:
- Tenant context injection
- Authentication token management
- Rate limit handling
- Error retry logic

Example usage:
```javascript
const citebots = new CitebotsSDK({
  apiKey: 'your-api-key',
  tenantId: 'tenant-uuid' // Optional for explicit tenant
});

const clients = await citebots.clients.list();
const report = await citebots.reports.generate({
  clientId: 'client-uuid',
  type: 'brand'
});
```