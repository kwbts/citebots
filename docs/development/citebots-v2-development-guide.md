# Citebots V2 Development Guide

## Core Philosophy

**TEST-DRIVEN DEVELOPMENT IS MANDATORY.** Every line of code must be written in response to a failing test. No exceptions.

**MICRO-STEP DEVELOPMENT IS REQUIRED.** Every change implemented in the smallest possible increments with validation at each step.

**HUMAN-IN-THE-LOOP IS CENTRAL.** Every decision point must allow manual review, adjustment, and approval before proceeding.

**EXTRACTION-FIRST APPROACH.** This Claude Code session will extract and document patterns from V1. You will act as intermediary between this session and the V2 implementation session.

## Development Workflow

### Two-Assistant Architecture

1. **Extraction Assistant (This Session)**
   - Analyzes existing V1 codebase
   - Extracts working patterns
   - Creates reference implementations
   - Documents lessons learned
   - Provides examples for V2

2. **Implementation Assistant (New Session)**
   - Receives extracted patterns via you
   - Implements fresh V2 codebase
   - Follows TDD strictly
   - Validates each micro-step

### Your Role as Intermediary

- Start each session with specific task
- Share relevant extractions from V1
- Validate progress at checkpoints
- Make decisions when ambiguity arises
- Ensure alignment between sessions

## Tech Stack

### V2 Architecture (Based on Migration Analysis)

**Frontend Tier**
- **Framework**: Next.js 14+ (App Router) + Tailwind CSS
- **Deployment**: Vercel for static assets and API routes
- **Real-time**: Supabase Realtime for progress updates

**Backend Tier**
- **API Layer**: Next.js API Routes for CRUD operations
- **Long-running Jobs**: Google Cloud Run with Cloud Tasks
- **Database**: Supabase (PostgreSQL with RLS for multi-tenancy)
- **Queue**: Google Cloud Tasks (managed queue system)

**Processing Tier**
- **Job Workers**: Containerized Node.js on Cloud Run
- **External APIs**: OpenAI, Perplexity, ScrapingBee
- **Caching**: Redis or Supabase for API response caching

**Development Stack**
- **Testing**: Vitest + Testing Library
- **Validation**: Zod for all data contracts
- **Monitoring**: Google Cloud Monitoring
- **Container**: Docker for job workers

### Key Architectural Decisions (From Migration Analysis)

1. **Job Processing**: Cloud Run + Cloud Tasks (60min max, cost-effective)
2. **Multi-tenancy**: Supabase RLS + tenant-aware job queues
3. **Cost Target**: $100-300/month for 25+ users
4. **Timeout Solution**: Job segmentation with checkpoint recovery
5. **Progress Tracking**: WebSocket updates via Supabase Realtime

## TDD Process for Citebots

### Red-Green-Refactor with Extraction

1. **Extract**: Find working pattern in V1
   - **Checkpoint**: Document what works/doesn't
2. **Red**: Write failing test for V2 behavior
   - **Checkpoint**: Confirm test fails correctly
3. **Green**: Implement minimal code to pass
   - **Checkpoint**: Test passes, all others still pass
4. **Refactor**: Improve while keeping tests green
   - **Checkpoint**: All tests pass, code is clean

### Citebots-Specific TDD Examples

```typescript
// Core behavior: "Should analyze citations for a client"
describe('Citation Analysis', () => {
  it('should find brand mentions in AI responses', async () => {
    const query = 'Best CRM software for startups';
    const client = { name: 'TechCorp', domain: 'techcorp.com' };
    
    const result = await analyzeCitations({ query, client });
    
    expect(result.mentions).toBeGreaterThanOrEqual(0);
    expect(result.position).toBeOneOf(['featured', 'mentioned', 'not_found']);
    expect(result.competitors).toBeArray();
  });

  it('should allow manual override of analysis results', async () => {
    const autoResult = { position: 'mentioned', confidence: 0.7 };
    const manualOverride = { position: 'featured', note: 'Actually first result' };
    
    const final = await processAnalysis({ 
      auto: autoResult, 
      manual: manualOverride 
    });
    
    expect(final.position).toBe('featured');
    expect(final.source).toBe('manual_override');
  });
});

// Long-running job behavior with segmentation
describe('Job Processing', () => {
  it('should segment long analysis into Cloud Run chunks', async () => {
    const largeJob = { clientId: 'client-1', queries: Array(100).fill('query') };
    
    const jobPlan = await createJobPlan(largeJob);
    
    expect(jobPlan.segments).toBeGreaterThan(1);
    expect(jobPlan.maxDuration).toBeLessThan(60 * 60 * 1000); // 60 min
    expect(jobPlan.checkpoints).toBeGreaterThan(0);
  });

  it('should handle multi-tenant resource isolation', async () => {
    const tenant1Job = { tenantId: 'tenant-1', priority: 'normal' };
    const tenant2Job = { tenantId: 'tenant-2', priority: 'normal' };
    
    await enqueueJob(tenant1Job);
    await enqueueJob(tenant2Job);
    
    const processing = await getActiveJobs();
    
    expect(processing.tenant1).toBeDefined();
    expect(processing.tenant2).toBeDefined();
    expect(processing.fairScheduling).toBe(true);
  });
});
```

## Micro-Step Validation Protocol

### Required After Every Change
```bash
npm test          # All tests pass
npm run typecheck # TypeScript validates
npm run lint      # Code style consistent
npm run build     # Production build works
```

### Session Checkpoints (Every 30-45 Minutes)
- Current extraction/implementation status
- Tests written vs passing
- Next immediate micro-step
- Blockers requiring human decision

### Commit Structure
- One test + implementation per commit
- Clear commit message: `feat: add citation analysis for brand mentions`
- All validation passing before commit

## Extraction Patterns

### Pattern Documentation Template

```markdown
## Pattern: [Name]

### V1 Implementation
- **Location**: /path/to/v1/file.ts
- **Dependencies**: What it needs
- **Issues**: Known problems

### Working Code
```typescript
// Extracted working implementation
```

### V2 Recommendation
- **Improvements**: What to change
- **Simplifications**: What to remove
- **Test First**: Example test to write

### Human Decision Points
- [ ] Should we keep this pattern?
- [ ] What modifications needed?
- [ ] Priority for implementation?
```

## Core Feature Testing Patterns

### Authentication Flow

```typescript
describe('Authentication', () => {
  it('should authenticate user with Supabase', async () => {
    const credentials = { email: 'test@example.com', password: 'secure123' };
    
    const { user, session } = await signIn(credentials);
    
    expect(user.email).toBe(credentials.email);
    expect(session.access_token).toBeDefined();
  });

  it('should enforce role-based access', async () => {
    const userSession = await signIn({ role: 'client' });
    
    const result = await accessAdminFeature(userSession);
    
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('insufficient_permissions');
  });
});
```

### Client Management

```typescript
describe('Client Management', () => {
  it('should create client with competitors', async () => {
    const clientData = {
      name: 'TestCorp',
      domain: 'testcorp.com',
      competitors: [
        { name: 'Rival Inc', domain: 'rival.com' }
      ]
    };
    
    const client = await createClient(clientData);
    
    expect(client.id).toBeDefined();
    expect(client.competitors).toHaveLength(1);
  });

  it('should allow manual competitor addition', async () => {
    const client = await createClient({ name: 'TestCorp' });
    const competitor = { name: 'NewRival', domain: 'newrival.com' };
    
    const updated = await addCompetitor(client.id, competitor);
    
    expect(updated.competitors).toContainEqual(
      expect.objectContaining(competitor)
    );
  });
});
```

### Analysis Pipeline

```typescript
describe('Analysis Pipeline', () => {
  it('should execute query across all platforms', async () => {
    const query = { text: 'Best SaaS tools', platforms: ['chatgpt', 'claude'] };
    
    const results = await executeQuery(query);
    
    expect(results.chatgpt).toBeDefined();
    expect(results.claude).toBeDefined();
    expect(results.timestamp).toBeRecent();
  });

  it('should handle platform failures gracefully', async () => {
    // Mock ChatGPT failure
    mockPlatformFailure('chatgpt');
    
    const results = await executeQuery({ 
      text: 'test query',
      platforms: ['chatgpt', 'claude'] 
    });
    
    expect(results.chatgpt.error).toBeDefined();
    expect(results.claude.success).toBe(true);
    expect(results.partial).toBe(true);
  });

  it('should allow manual result editing', async () => {
    const autoResults = await executeQuery({ text: 'test' });
    const manualEdit = {
      platform: 'chatgpt',
      edited: { position: 1, featured: true }
    };
    
    const final = await applyManualEdits(autoResults, [manualEdit]);
    
    expect(final.chatgpt.position).toBe(1);
    expect(final.chatgpt.source).toBe('manual_edit');
  });
});
```

## Development Micro-Steps

### Phase 1: Extraction (Current Session)

#### Step 1: Core Patterns
1. Extract authentication flow from V1
2. Document database schema patterns
3. Extract working API endpoints
4. Identify reusable UI components
5. **Human checkpoint**: Review extractions

#### Step 2: Business Logic
1. Extract citation analysis algorithm
2. Document query generation patterns
3. Extract competitor comparison logic
4. Map reporting queries
5. **Human checkpoint**: Validate logic

#### Step 3: Create References
1. Build simplified database schema
2. Create API contract definitions
3. Generate sample test data
4. Document deployment process
5. **Human checkpoint**: Approve for V2

### Phase 2: V2 Implementation (New Session)

#### Step 1: Foundation
1. Test: Next.js app should render
2. Implement: Basic Next.js setup
3. Test: Tailwind styles should apply
4. Implement: Tailwind configuration
5. **Human checkpoint**: Validate setup

#### Step 2: Database Layer
1. Test: Should connect to Supabase
2. Implement: Database client
3. Test: Should run migrations
4. Implement: Migration system
5. **Human checkpoint**: Verify schema

#### Step 3: Authentication
1. Test: Should authenticate user
2. Implement: Supabase auth integration
3. Test: Should protect routes
4. Implement: Middleware protection
5. **Human checkpoint**: Test login flow

#### Step 4: Job Processing System
1. Test: Should create Cloud Tasks jobs
2. Implement: Task queue integration
3. Test: Should segment long jobs
4. Implement: Job segmentation logic
5. **Human checkpoint**: Validate job flow

#### Step 5: Core Features
1. Test: Should CRUD clients with multi-tenancy
2. Implement: Client management with RLS
3. Test: Should analyze citations via jobs
4. Implement: Analysis pipeline
5. **Human checkpoint**: Validate results

#### Step 6: Progress Tracking
1. Test: Should track job progress
2. Implement: Progress updates
3. Test: Should notify via WebSockets
4. Implement: Realtime notifications
5. **Human checkpoint**: Test user experience

## Data Validation with Zod

### Schema-First Development

```typescript
// Multi-tenant schema with job processing
const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  subscription_tier: z.enum(['basic', 'premium', 'enterprise']),
  api_quota: z.number().positive(),
  created_at: z.string().datetime()
});

const ClientSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(), // Multi-tenancy
  name: z.string().min(1),
  domain: z.string().url(),
  competitors: z.array(z.object({
    name: z.string(),
    domain: z.string().url()
  }))
});

const JobSchema = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  client_id: z.string().uuid(),
  status: z.enum(['queued', 'processing', 'completed', 'failed']),
  progress: z.object({
    completed_tasks: z.number(),
    total_tasks: z.number(),
    current_stage: z.string()
  }),
  segments: z.array(z.object({
    id: z.string(),
    status: z.enum(['pending', 'processing', 'completed', 'failed']),
    cloud_task_id: z.string().optional()
  })),
  created_at: z.string().datetime(),
  estimated_completion: z.string().datetime().optional()
});

const AnalysisResultSchema = z.object({
  job_id: z.string().uuid(),
  query: z.string(),
  platform: z.enum(['chatgpt', 'claude', 'perplexity']),
  mentions: z.array(z.object({
    position: z.number(),
    context: z.string(),
    featured: z.boolean()
  })),
  timestamp: z.string().datetime(),
  source: z.enum(['automated', 'manual_edit']),
  confidence: z.number().min(0).max(1)
});

// Runtime validation with tenant context
export const validateClientData = (data: unknown, tenantId: string): Client => {
  const client = ClientSchema.parse(data);
  if (client.tenant_id !== tenantId) {
    throw new Error('Tenant ID mismatch');
  }
  return client;
};
```

## Human-in-the-Loop Patterns

### Decision Points

```typescript
interface HumanDecisionPoint<T> {
  automated: T;
  confidence: number;
  requiresReview: boolean;
  allowOverride: boolean;
}

const analyzeWithHumanReview = async (
  query: string
): Promise<AnalysisResult> => {
  // 1. Automated analysis
  const automated = await runAutomatedAnalysis(query);
  
  // 2. Check confidence
  const decision: HumanDecisionPoint<AnalysisResult> = {
    automated,
    confidence: automated.confidence,
    requiresReview: automated.confidence < 0.8,
    allowOverride: true
  };
  
  // 3. Human review if needed
  if (decision.requiresReview) {
    return await requestHumanReview(decision);
  }
  
  return automated;
};
```

### Manual Interventions

```typescript
describe('Manual Interventions', () => {
  it('should preserve manual edits through pipeline', async () => {
    const analysis = await runAnalysis({ query: 'test' });
    const manualEdit = { position: 1, note: 'Actually featured' };
    
    const edited = await applyManualEdit(analysis, manualEdit);
    const report = await generateReport(edited);
    
    expect(report.data.position).toBe(1);
    expect(report.metadata.hasManualEdits).toBe(true);
  });
});
```

## Session Communication Protocol

### From Extraction to Implementation

```typescript
// extraction-results.md
interface ExtractionResult {
  pattern: string;
  v1Location: string;
  workingCode: string;
  recommendedChanges: string[];
  testExample: string;
  priority: 'high' | 'medium' | 'low';
}
```

### Daily Handoff Format

```markdown
## Session Handoff: [Date]

### Completed Extractions
- [x] Authentication pattern (see: /extractions/auth.md)
- [x] Database schema (see: /extractions/schema.sql)

### Ready for Implementation
1. **Feature**: User Authentication
   - Test first: /tests/auth.test.ts
   - Reference: /extractions/auth.md
   - Decision needed: Use Supabase RLS?

### Blockers Requiring Decision
- [ ] Should we keep complex RLS policies?
- [ ] Unify competitor storage approach?

### Next Session Focus
Start with authentication tests from /tests/auth.test.ts
```

## Success Criteria

### Every Development Session Must
- Start with clear extraction or implementation goal
- Write tests before any implementation
- Include human validation checkpoints
- End with working, tested progress

### Every Feature Must
- Have comprehensive test coverage
- Support manual overrides
- Handle errors gracefully
- Be simpler than V1 equivalent

### Every Extraction Must
- Include working V1 code
- Document known issues
- Provide test examples
- Suggest improvements

## Code Quality Rules

### TypeScript
- Strict mode always enabled
- No `any` types without justification
- Prefer interfaces over types
- Use discriminated unions for states

### Architecture
- Single responsibility per module
- Dependency injection over imports
- Pure functions where possible
- Explicit over implicit

### Testing
- Behavior over implementation
- Real data structures in tests
- Mock only external services
- Test the happy path first

## Critical V1 Problems Solved in V2

### V1 Timeout Issues
- **Problem**: Edge Functions timeout at 30-60 seconds, analysis needs 2+ hours
- **V2 Solution**: Cloud Run (60min max) + job segmentation with checkpoints
- **Implementation**: Store progress after each segment, resume from last checkpoint

### V1 Local Server Bottleneck  
- **Problem**: Development-only local server can't handle production load
- **V2 Solution**: Containerized workers on Cloud Run with auto-scaling
- **Implementation**: Docker containers that scale to zero when idle

### V1 Single-Tenant Architecture
- **Problem**: No isolation between users, resource competition
- **V2 Solution**: Supabase RLS + tenant-aware job queues
- **Implementation**: All data filtered by tenant_id, fair scheduling

### V1 Cost Explosion Risk
- **Problem**: Uncontrolled API usage could exceed budget
- **V2 Solution**: API caching + quota management + cost monitoring
- **Implementation**: 60-80% cache hit rate, per-tenant quotas

## Architecture Migration Strategy

### Phase 1: Containerization (Week 1-2)
```typescript
// Test-first containerization
describe('Container Migration', () => {
  it('should containerize existing analysis logic', async () => {
    const container = await buildAnalysisContainer();
    const result = await runContainer(container, sampleAnalysisJob);
    
    expect(result.status).toBe('completed');
    expect(result.output).toMatchV1Results();
  });
});
```

### Phase 2: Job Segmentation (Week 3-4)
```typescript
// Long job segmentation
describe('Job Segmentation', () => {
  it('should split 3-hour job into 60-min segments', async () => {
    const longJob = createLongRunningJob({ estimatedHours: 3 });
    const segments = await segmentJob(longJob);
    
    expect(segments.length).toBeGreaterThan(3);
    expect(segments.every(s => s.maxDuration < 60 * 60 * 1000)).toBe(true);
  });
});
```

### Phase 3: Multi-tenancy (Week 5-6)
```typescript
// Tenant isolation
describe('Multi-tenancy', () => {
  it('should isolate tenant data via RLS', async () => {
    const tenant1Client = await createClient({ tenantId: 'tenant-1' });
    const tenant2Session = await createSession({ tenantId: 'tenant-2' });
    
    const accessAttempt = await getClient(tenant1Client.id, tenant2Session);
    
    expect(accessAttempt).toBeNull(); // RLS blocks cross-tenant access
  });
});
```

## Anti-Patterns to Avoid (Learned from V1)

1. **Edge Function Dependency**: Never rely on functions with hard timeouts
2. **Synchronous Long Operations**: Always use async job queues  
3. **Single Point of Failure**: Segment jobs for fault tolerance
4. **Uncontrolled API Usage**: Implement caching and quotas from day 1
5. **Mixed Deployment Targets**: One deployment strategy only
6. **Complex RLS Policies**: Simple tenant_id filtering only
7. **Local Development Dependencies**: Production-ready from start

## Remember

- **Extraction before Implementation**
- **Tests before Code**
- **Human Review at Checkpoints**
- **Working beats Perfect**
- **Simple beats Clever**

The goal is to build a maintainable, testable platform that delivers business value through clear, incremental progress.