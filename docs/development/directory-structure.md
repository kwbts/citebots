# Citebots Directory Structure

## Root Directory Layout

```
kb-citebots/
├── .env                     # Environment variables (git-ignored)
├── .env.example             # Example environment variables
├── .gitignore              # Git ignore file
├── package.json            # NPM dependencies
├── nuxt.config.ts          # Nuxt configuration
├── tailwind.config.js      # Tailwind CSS config
├── tsconfig.json           # TypeScript config
├── netlify.toml            # Netlify deployment config
├── README.md               # Project readme
├── CLAUDE.md              # AI assistant instructions
│
├── app/                    # Nuxt 3 app directory
│   ├── pages/             # Route pages
│   ├── components/        # Vue components
│   ├── layouts/           # Page layouts
│   ├── composables/       # Vue composables
│   ├── middleware/        # Route middleware
│   ├── plugins/           # Nuxt plugins
│   └── assets/            # CSS, images, etc.
│
├── server/                 # Server-side code
│   ├── api/               # API routes
│   ├── middleware/        # Server middleware
│   └── utils/             # Server utilities
│
├── lib/                    # Shared libraries
│   ├── supabase.ts        # Supabase client
│   ├── types.ts           # TypeScript types
│   ├── constants.ts       # App constants
│   └── utils.ts           # Utility functions
│
├── netlify/               # Netlify-specific
│   └── functions/         # Edge functions
│
├── services/              # Business logic
│   ├── auth.ts            # Authentication service
│   ├── clients.ts         # Client management
│   ├── analysis.ts        # Analysis engine
│   └── sharing.ts         # Share link service
│
├── scripts/               # Build/deploy scripts
│   ├── setup-db.js        # Database setup
│   └── seed-data.js       # Sample data
│
├── public/                # Static files
│   ├── favicon.ico        # Favicon
│   └── robots.txt         # SEO
│
├── tests/                 # Test files (future)
│   ├── unit/             # Unit tests
│   └── e2e/              # End-to-end tests
│
└── docs/                  # Documentation
    ├── project/          # Project docs
    ├── architecture/     # Architecture docs
    ├── development/      # Dev guides
    └── ...              # Other docs
```

## Detailed Directory Breakdown

### `/app` - Nuxt Application

```
app/
├── pages/
│   ├── index.vue           # Landing/login page
│   ├── dashboard.vue       # Main dashboard
│   ├── clients/
│   │   ├── index.vue       # Client list
│   │   └── [id].vue        # Client detail
│   ├── share/
│   │   └── [token].vue     # Public share view
│   └── auth/
│       ├── login.vue       # Login page
│       └── logout.vue      # Logout handler
│
├── components/
│   ├── layout/
│   │   ├── AppHeader.vue   # App header
│   │   ├── AppFooter.vue   # App footer
│   │   └── Navigation.vue  # Nav menu
│   ├── clients/
│   │   ├── ClientCard.vue  # Client display
│   │   ├── ClientForm.vue  # Create/edit form
│   │   └── ClientList.vue  # List component
│   ├── analysis/
│   │   ├── RunButton.vue   # Trigger analysis
│   │   ├── Results.vue     # Show results
│   │   └── Progress.vue    # Progress bar
│   └── common/
│       ├── Button.vue      # Reusable button
│       ├── Card.vue        # Card component
│       └── Loading.vue     # Loading spinner
│
├── layouts/
│   ├── default.vue         # Auth required layout
│   └── public.vue          # Public pages layout
│
├── composables/
│   ├── useAuth.ts          # Authentication hook
│   ├── useClients.ts       # Client data hook
│   └── useAnalysis.ts      # Analysis hook
│
└── middleware/
    ├── auth.ts             # Route protection
    └── guest.ts            # Redirect if auth
```

### `/server` - Server-side Code

```
server/
├── api/
│   ├── auth/
│   │   ├── login.post.ts   # Login endpoint
│   │   └── logout.post.ts  # Logout endpoint
│   ├── clients/
│   │   ├── index.get.ts    # List clients
│   │   ├── index.post.ts   # Create client
│   │   ├── [id].get.ts     # Get client
│   │   └── [id].put.ts     # Update client
│   ├── analysis/
│   │   ├── run.post.ts     # Start analysis
│   │   └── [id].get.ts     # Get results
│   └── share/
│       ├── create.post.ts  # Create share link
│       └── [token].get.ts  # Get shared data
│
└── utils/
    ├── auth.ts             # Auth utilities
    └── db.ts               # Database helpers
```

### `/services` - Business Logic

```
services/
├── auth.ts                 # Authentication logic
├── clients.ts              # Client operations
├── analysis.ts             # Analysis engine
├── sharing.ts              # Share links
└── scraper.ts              # Web scraping
```

### `/lib` - Shared Libraries

```
lib/
├── supabase.ts             # Supabase client setup
├── types.ts                # TypeScript interfaces
├── constants.ts            # App-wide constants
└── utils.ts                # Helper functions
```

## File Naming Conventions

- **Pages**: kebab-case (`client-list.vue`)
- **Components**: PascalCase (`ClientCard.vue`)
- **Composables**: camelCase with `use` prefix (`useAuth.ts`)
- **Services**: camelCase (`authService.ts`)
- **Types**: PascalCase for interfaces (`ClientProfile`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)

## MVP Priority Directories

For the weekend sprint, focus on:

1. `/app/pages/` - Core pages
2. `/app/components/` - Essential components
3. `/server/api/` - API endpoints
4. `/lib/` - Supabase setup
5. `/services/` - Core business logic

Skip for now:
- `/tests/` - Testing later
- Advanced component organization
- Complex middleware
- Optimization scripts