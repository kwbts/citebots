# Essential Files Migration Guide - Citebots Rebuild

## 🎯 Overview

This guide identifies the essential files to keep when rebuilding the Citebots application from scratch. These files contain proven business logic, working functionality, and valuable IP that would be time-consuming to recreate.

## 📋 Essential Files by Category

### **1. 🔧 Configuration & Infrastructure**

| File | Priority | Why Keep |
|------|----------|----------|
| `nuxt.config.ts` | **CRITICAL** | Core app configuration, Supabase integration, environment setup |
| `package.json` | **CRITICAL** | Dependencies, scripts, project metadata |
| `lib/supabase.ts` | **CRITICAL** | Database client setup and configuration |

### **2. 🗄️ Database Schema**

| File | Priority | Why Keep |
|------|----------|----------|
| `scripts/schema/supabase-setup.sql` | **CRITICAL** | Core auth tables, profiles, access_requests |
| `scripts/schema/create-clients-tables.sql` | **CRITICAL** | Client and competitor tables with RLS |
| `scripts/schema/create-analysis-tables.sql` | **CRITICAL** | Analysis results storage (analysis_runs, page_analyses) |

### **3. 🧠 Core Business Logic (Composables)**

| File | Priority | Why Keep |
|------|----------|----------|
| `composables/useAnalysisRunner.ts` | **CRITICAL** | Core analysis execution engine |
| `composables/useQueueAnalysis.ts` | **CRITICAL** | Queue-based analysis system |
| `composables/useCompetitorData.ts` | **HIGH** | Competitor analysis logic |
| `composables/useAIEnhancement.ts` | **HIGH** | AI client enhancement patterns |
| `composables/useBriefGenerator.ts` | **HIGH** | Content brief generation logic |

### **4. ⚡ Supabase Edge Functions**

| File | Priority | Why Keep |
|------|----------|----------|
| `supabase/functions/enhance-client-with-ai/index.ts` | **HIGH** | AI client enhancement with OpenAI |
| `supabase/functions/generate-queries/index.ts` | **HIGH** | AI-powered query generation |
| `supabase/functions/content-brief-generator/index.ts` | **HIGH** | Content brief generation |
| `supabase/functions/create-client-user/index.ts` | **MEDIUM** | User management |
| `supabase/functions/_shared/cors.ts` | **MEDIUM** | CORS handling utility |

### **5. 📊 Analysis Engine (Backend)**

| File | Priority | Why Keep |
|------|----------|----------|
| `local-server/brief-generator/enhanced-citebots.js` | **HIGH** | Core analysis engine with citation extraction |
| `local-server/brief-generator/lib/citationExtractor.js` | **HIGH** | Citation extraction from LLM responses |
| `local-server/brief-generator/lib/webCrawler.js` | **HIGH** | Web scraping and content analysis |

### **6. 🎨 Frontend Core Pages**

| File | Priority | Why Keep |
|------|----------|----------|
| `pages/index.vue` | **HIGH** | Landing/login page |
| `pages/dashboard/index.vue` | **HIGH** | Main dashboard navigation |
| `pages/dashboard/clients/index.vue` | **HIGH** | Client management interface |
| `pages/dashboard/analysis/index.vue` | **MEDIUM** | Analysis execution interface |
| `pages/dashboard/reports/[id].vue` | **MEDIUM** | Report viewing |

### **7. 📈 Reporting Components**

| File | Priority | Why Keep |
|------|----------|----------|
| `components/reports/BrandPerformanceDashboard.vue` | **HIGH** | Brand performance reporting |
| `components/reports/components/MetricCard.vue` | **MEDIUM** | Reusable metric display |
| `components/reports/components/ChartComponents.vue` | **MEDIUM** | Chart visualization |
| `components/reports/components/DataTable.vue` | **MEDIUM** | Data table component |

### **8. 🔐 Authentication & Security**

| File | Priority | Why Keep |
|------|----------|----------|
| `middleware/auth.ts` | **CRITICAL** | Authentication middleware |
| `server/utils/supabase.ts` | **CRITICAL** | Server-side database utils |

### **9. 🎨 Layout System**

| File | Priority | Why Keep |
|------|----------|----------|
| `layouts/dashboard.vue` | **HIGH** | Main dashboard layout |
| `components/layout/SidebarContextPanel.vue` | **MEDIUM** | Sidebar navigation |
| `components/layout/SidebarIconBar.vue` | **MEDIUM** | Icon-based navigation |

### **10. 🛠️ Utility Files**

| File | Priority | Why Keep |
|------|----------|----------|
| `composables/useDarkMode.ts` | **LOW** | Dark mode functionality |
| `utils/` folder | **MEDIUM** | General utility functions |

## 🚫 Files to Exclude

### **Debug & Testing Files**
- `**/test-*`
- `**/debug-*`
- `**/check-*`
- `**/verify-*`
- `minimal-test.js`
- `test-supabase-connection.js`

### **Backup & Archive Files**
- `**/*backup*`
- `**/*archived*`
- `scripts/_archived-*`
- `*.backup`
- `*.old`

### **Documentation (Move to Docs)**
- `BRIEF-*.md`
- `REFACTOR_*.md`
- `ROLLBACK_*.md`
- `TESTING_*.md`

## 🗂️ Suggested New Project Structure

```
citebots-alpha/
├── 📁 app/                          # Main application
│   ├── 📁 components/
│   │   ├── 📁 layout/              # Keep layout components
│   │   ├── 📁 reports/             # Keep report components
│   │   └── 📁 ui/                  # New: Clean UI components
│   ├── 📁 composables/             # Keep all essential composables
│   ├── 📁 pages/                   # Keep core pages, rebuild UI
│   ├── 📁 middleware/              # Keep auth middleware
│   ├── 📁 server/                  # Keep server utils
│   ├── 📁 lib/                     # Keep supabase client
│   └── 📁 utils/                   # Keep utility functions
├── 📁 supabase/                    # Keep entire supabase folder
│   ├── 📁 functions/               # Keep essential functions
│   └── 📁 migrations/              # Keep schema files
├── 📁 analysis-engine/             # Keep backend analysis logic
│   ├── 📁 lib/                     # Keep citation extractor, web crawler
│   └── enhanced-citebots.js        # Keep core analysis engine
└── 📁 docs/                        # Move all documentation here
```

## 🚀 Migration Strategy

### **Phase 1: Foundation (Days 1-2)**
1. Create new Nuxt project
2. Copy configuration files
3. Set up Supabase connection
4. Copy database schema
5. Deploy basic app

### **Phase 2: Core Logic (Days 3-5)**
1. Copy essential composables
2. Copy Supabase edge functions
3. Copy authentication system
4. Test core functionality

### **Phase 3: UI Rebuild (Days 6-10)**
1. Copy layout components
2. Rebuild pages with cleaner UI
3. Copy report components
4. Test user workflows

### **Phase 4: Backend Integration (Days 11-14)**
1. Copy analysis engine
2. Set up processing pipeline
3. Test end-to-end analysis
4. Performance optimization

## 🔄 File Copy Commands

```bash
# Create new project
npx create-nuxt-app@latest citebots-alpha
cd citebots-alpha

# Copy essential configuration
cp ../kb-citebots/nuxt.config.ts ./
cp ../kb-citebots/package.json ./
cp -r ../kb-citebots/lib ./

# Copy business logic
cp -r ../kb-citebots/composables ./
cp -r ../kb-citebots/middleware ./
cp -r ../kb-citebots/server ./

# Copy Supabase setup
cp -r ../kb-citebots/supabase ./
# But exclude archived functions
rm -rf ./supabase/functions/_archived*

# Copy essential pages (then rebuild UI)
mkdir -p pages/dashboard
cp ../kb-citebots/pages/index.vue ./pages/
cp ../kb-citebots/pages/dashboard/index.vue ./pages/dashboard/
cp -r ../kb-citebots/pages/dashboard/clients ./pages/dashboard/

# Copy analysis engine
cp -r ../kb-citebots/local-server ./analysis-engine
```

## 🎯 Success Metrics

After migration, you should have:
- ✅ Working authentication
- ✅ Client management
- ✅ Analysis execution
- ✅ Report generation
- ✅ Clean, maintainable codebase
- ✅ Reduced technical debt

## 📝 Notes

1. **Database Schema**: Keep all existing schema - it's proven and working
2. **Edge Functions**: Your current functions are well-structured
3. **Business Logic**: Composables contain valuable IP
4. **UI Components**: Copy structure, but consider rebuilding for cleaner design
5. **Backend Engine**: Complex but working - copy as-is initially

## 🔮 Future Enhancements

After successful migration:
- Implement proper TypeScript throughout
- Add comprehensive testing
- Optimize performance
- Add monitoring/analytics
- Consider migrating to Google Cloud Run when needed

---

**Remember**: This is about preserving proven business logic while cleaning up the codebase. Start with the CRITICAL files and work your way down.