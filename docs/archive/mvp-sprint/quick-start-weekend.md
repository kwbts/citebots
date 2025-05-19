# Quick Start Guide - Weekend MVP

## Prerequisites

- Netlify account
- Supabase account  
- OpenAI API key (or Claude)
- GitHub repository
- Node.js 18+ installed

## Hour 1: Initial Setup

```bash
# Clone and setup
git clone [your-repo]
cd citebots
npm install

# Environment variables
cp .env.example .env
# Add your keys to .env
```

## Hour 2: Supabase Setup

1. Create new Supabase project
2. Run minimal schema:

```sql
-- Minimal tables for MVP
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id),
  query TEXT NOT NULL,
  result JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE share_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  analysis_id UUID REFERENCES analyses(id),
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Hour 3: Netlify Deployment

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login and init
netlify login
netlify init

# Deploy
netlify deploy --prod
```

## Hour 4: Core Backend

Create minimal API endpoints:

1. `/api/auth/login` - Simple authentication
2. `/api/clients` - CRUD for clients
3. `/api/analyses/run` - Execute LLM query
4. `/api/share` - Generate view link

## Hour 5-6: Minimal Frontend

```vue
<!-- Login.vue -->
<template>
  <form @submit="login">
    <input v-model="email" type="email" required>
    <input v-model="password" type="password" required>
    <button type="submit">Login</button>
  </form>
</template>

<!-- Dashboard.vue -->
<template>
  <div>
    <h1>Clients</h1>
    <button @click="runAnalysis">Run Analysis</button>
    <div v-if="results">
      <pre>{{ results }}</pre>
      <button @click="share">Get Share Link</button>
    </div>
  </div>
</template>
```

## Hour 7: Testing

1. Create test client
2. Run sample analysis
3. Generate share link
4. Verify link works

## Hour 8: Demo Prep

1. Clean up critical bugs
2. Add minimal styling
3. Create demo data
4. Practice demo flow

## What to Skip

- Complex UI components
- Multiple user roles
- Advanced reporting
- All error handling
- Performance optimization
- Multiple LLM services

## Demo Talking Points

1. "Working backend validated"
2. "Secure data storage"
3. "Client access via links"
4. "Foundation for scaling"
5. "Next sprint: reporting"

## If Things Go Wrong

- Use mock data if API fails
- Show Supabase dashboard as backup
- Emphasize architecture over features
- Focus on business value