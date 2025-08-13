# Citebots Migration Architecture Analysis

## Overview and Current State

Citebots is an SEO/digital marketing analytics platform that analyzes citations in AI responses (ChatGPT, Claude, Perplexity) to help organizations optimize their content. The platform processes user queries through multiple LLMs, extracts citations from responses, crawls those pages, and performs detailed analysis of content quality, technical SEO factors, and brand presence.

### Current Architecture
- **Frontend**: Nuxt.js application deployed on Netlify
- **Database**: Supabase (PostgreSQL) with row-level security
- **Processing**: Mix of Supabase Edge Functions and a local Node.js server
- **Web crawling**: ScrapingBee API for accessing cited web pages
- **AI integration**: OpenAI and Perplexity APIs

### Key Limitations
1. **Edge Function Timeouts**: 30-60 second timeouts while analysis runs require 2+ hours
2. **Local Server Constraints**: Current solution works for development but not production
3. **Multi-tenancy**: Need to support 25+ users by end of summer
4. **Resource Competition**: Must prevent tenant workloads from interfering with each other

## Architectural Options Analysis

We've evaluated several architectural approaches for the migration. Here's a comparison of the leading options:

### Option 1: Containerized Job Processing with Queue Management (BullMQ/Redis)

**Key Components**:
- **Supabase**: Continue using for data storage and authentication
- **Railway/DigitalOcean**: Host containerized job workers
- **BullMQ/Redis**: Queue management and caching
- **WebSockets**: Real-time progress updates

**Pros**:
- No timeout limitations for long-running processes
- Strong Node.js ecosystem compatibility
- Excellent support for job prioritization and fine-grained control
- Established pattern with many production examples
- Estimated cost: $165-245/month

**Cons**:
- Requires containerization of existing local server
- Adds Redis as another service to maintain
- Potential higher operational complexity

### Option 2: Google Cloud Run with Cloud Tasks

**Key Components**:
- **Supabase**: Continue using for data storage and authentication
- **Google Cloud Run**: Host containerized job workers
- **Google Cloud Tasks**: Managed queue for job orchestration
- **Supabase Realtime**: Optional progress tracking via WebSockets

**Pros**:
- Up to 60-minute execution time per container instance
- Pay only for actual CPU/memory usage with scale-to-zero
- Fully managed services with minimal operational overhead
- Built-in retry and backoff policies
- Generous free tier for initial development
- Estimated cost: $40-75/month

**Cons**:
- 60-minute maximum execution requires job chunking
- Requires adapting to Google Cloud ecosystem
- Limited control compared to self-managed queue systems

### Option 3: Temporal.io with Containerized Workers

**Key Components**:
- **Supabase**: Continue using for data storage and authentication
- **Temporal.io Cloud**: Workflow orchestration
- **Railway/DigitalOcean**: Host worker containers
- **Native Temporal UI**: Workflow monitoring and debugging

**Pros**:
- Native support for workflows running days or months
- Automatic handling of retries and failure recovery
- Built-in workflow visualization and debugging tools
- Workflow versioning and history
- Lower infrastructure cost: $60-80/month

**Cons**:
- New technology to learn and integrate
- More complex initial setup
- Less Node.js-specific compared to BullMQ

### Option 4: AWS SQS with ECS Fargate

**Key Components**:
- **Supabase**: Continue using for data storage and authentication
- **AWS SQS**: Message queue for job management
- **AWS ECS Fargate**: Containerized job processing
- **AWS CloudWatch**: Monitoring and logging

**Pros**:
- Well-established, enterprise-grade solution
- Support for 12+ hour jobs
- Comprehensive monitoring and logging
- Good scaling properties

**Cons**:
- Higher cost: $130-150/month
- More complex configuration
- AWS ecosystem learning curve

## Multi-tenancy Implementation

All architectural options will implement multi-tenancy using these core principles:

1. **Data Isolation**: Leverage Supabase Row Level Security (RLS)
   ```sql
   ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY tenant_isolation_policy ON your_table
   FOR ALL USING (
     tenant_id = (
       (current_setting('request.jwt.claims', true)::json ->> 'app_metadata')::json ->> 'tenant_id'
     )::text
   );
   ```

2. **Processing Isolation**:
   - Process queue items by tenant_id to avoid resource competition
   - Implement tenant-based rate limiting for external APIs
   - Consider separate processing containers or queues for high-volume tenants

3. **Resource Management**:
   - Implement token bucket algorithms for API quotas
   - Use Redis or other caching for frequently accessed data
   - Apply tenant-specific quotas for large analysis runs

### Multi-Tenant Queue Strategies

Multiple approaches exist for fair resource allocation between tenants:

1. **Separate Queues Per Tenant**: Create isolated queues for each tenant to prevent noisy neighbor problems.

2. **Round-Robin Processing**: Alternate between processing tasks from different tenants to ensure fairness.

3. **Worker-Controlled Rotation**: Have workers re-enqueue the next task for a job after completing the current one, naturally yielding to other jobs.

4. **Priority Tiers**: Implement different priority levels for premium vs. standard customers if needed.

## Job Orchestration Options

### Cloud Tasks Approach
Google Cloud Tasks provides a fully-managed queue system with several advantages:

- **HTTP-based task execution**: Tasks trigger HTTP endpoints on your Cloud Run services
- **Automatic retries with backoff**: Failed tasks automatically retry with configurable policies
- **Rate limiting**: Control dispatch rate to respect external API limits
- **No infrastructure to manage**: Fully serverless queue management

Example workflow:
1. User initiates job, which creates a database record and enqueues tasks
2. Each task is delivered to Cloud Run via HTTP POST
3. Workers process tasks and update progress in Supabase
4. Frontend polls or subscribes to Supabase for status updates

### Internal Heartbeat Approach
A simpler approach using Cloud Run with an internal scheduling mechanism:

- **Stateless scheduling**: Job state tracked entirely in Supabase
- **Periodic polling**: Cloud Run container wakes up on schedule to check for work
- **Chunked processing**: Handle a batch of work, store progress, then exit
- **No additional services**: Fewer moving parts to manage

This approach is simpler but less robust than a dedicated queue system.

## Cost Optimization Strategies

To maintain the target budget of $100-300/month while supporting 25+ users:

1. **API Cost Reduction**:
   - Implement caching layer to reduce API calls by 60-80%
   - Use GPT-4o-mini for 90% of analyses
   - Apply intelligent retry logic and request batching

2. **Infrastructure Optimization**:
   - Use containers that scale to zero when not active
   - Implement efficient queue polling with exponential backoff
   - Optimize database queries with proper indexing

3. **Processing Efficiency**:
   - Parallelize independent web crawling operations
   - Implement incremental analysis to process partial results
   - Cache intermediate results for faster response times

## User Experience and Progress Tracking

Providing visibility into long-running jobs is crucial:

1. **Progress Tracking**:
   - Store completed_tasks/total_tasks in job records
   - Calculate percentage complete and estimated completion time
   - Update progress atomically with each task completion

2. **Status Updates**:
   - Use Supabase Realtime for push notifications via WebSockets
   - Alternatively implement polling of job status
   - Store detailed logs for troubleshooting

3. **Result Streaming**:
   - Display partial results as they become available
   - Allow users to view completed analyses while others are in progress

4. **Job Control**:
   - Add cancellation capability for long-running jobs
   - Implement retry options for failed tasks

## Error Handling and Resilience

For robust processing:

1. **Automatic Retries**:
   - Configure retry policies with backoff
   - Track attempt counts to prevent infinite retries

2. **Idempotent Processing**:
   - Design tasks to be safely repeatable
   - Use database flags to track completion state

3. **Failure Management**:
   - Record specific error messages for user visibility
   - Implement dead-letter queues for failed tasks
   - Continue processing other tasks when some fail

4. **Checkpoint-Based Recovery**:
   - Store intermediate state after each task
   - Enable resuming from last successful point

## Recommendation and Rationale

After evaluating all options against our requirements for long-running processes, multi-tenancy, and budget constraints, we recommend **Option 2: Google Cloud Run with Cloud Tasks** as the initial migration path for these reasons:

1. **Balanced Complexity/Power**: Provides robust queue management without excessive operational burden
2. **Cost Efficiency**: Lowest estimated cost ($40-75/month) with generous free tier
3. **Operational Simplicity**: Fully managed services requiring minimal maintenance
4. **Scalability**: Automatically handles varying workloads with scale-to-zero cost savings
5. **Compatibility**: Works well with existing Supabase infrastructure

While the 60-minute execution limit requires job segmentation, this approach provides better resiliency through checkpoint-based processing. Storing intermediate results in Supabase after each task makes the system more fault-tolerant against occasional failures.

## Implementation Roadmap

### Phase 1 (Weeks 1-2): Container Migration
- Containerize existing local-server
- Deploy to Google Cloud Run
- Implement basic Cloud Tasks integration
- Set up Supabase RLS policies for multi-tenancy

### Phase 2 (Weeks 3-4): Queue Management
- Implement job segmentation for 60+ minute processes
- Create progress tracking mechanism
- Develop detailed status reporting
- Add API response caching layer

### Phase 3 (Weeks 5-6): Optimization
- Implement tenant-specific rate limiting
- Configure per-tenant task queues if needed
- Set up monitoring and alerting
- Add comprehensive error handling

### Phase 4 (Ongoing): Scaling
- Evaluate moving to BullMQ or Temporal.io if needed
- Consider dedicated instances for high-volume tenants
- Implement auto-scaling based on queue depth
- Optimize for cost vs. performance

## Future Considerations

As the platform grows beyond 25 users, we may need to:

1. Evaluate switching to a more robust job orchestration system
2. Consider database sharding for multi-tenancy at scale
3. Implement more sophisticated caching strategies
4. Explore dedicated processing for premium customers

The proposed architecture provides a solid foundation that can evolve to meet these future needs while keeping current operational complexity and costs manageable.

## Alternative Evaluation: Temporal.io

If job orchestration complexity increases significantly, Temporal.io presents a compelling alternative:

- **Durable workflows**: Can run for days or months without timeouts
- **Comprehensive retry policies**: Built-in handling of transient failures
- **Versioned workflows**: Support for changing workflow code without disrupting running instances
- **Visual debugging**: Temporal UI provides deep visibility into workflow execution

At $60-80/month, Temporal.io represents a cost-effective option for complex workflows, though it introduces additional learning curve and integration work compared to Cloud Tasks.