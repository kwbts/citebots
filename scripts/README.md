# Citebots SQL Scripts

This directory contains SQL scripts for managing the Citebots database structure and data. The scripts are organized into directories by purpose to make them easier to find and use.

## Directory Structure

```
scripts/
├── schema/     # Table creation scripts (database schema definition)
├── migrations/ # Schema changes and data migrations
├── rls/        # Row Level Security policies and permissions
├── utils/      # Utility scripts for verification and checking
└── archive/    # Historical scripts (kept for reference)
```

## Schema Scripts

These scripts define the core database structure and should be run when setting up a new environment:

- `create-clients-tables.sql` - Creates clients and related tables
- `create-analysis-tables.sql` - Creates analysis, queries, and results tables
- `supabase-setup.sql` - Initial database setup and configuration

## Migration Scripts

These scripts modify existing tables or data and should be run in order:

- `add-*.sql` - Add new columns or features to existing tables
- `update-*.sql` - Update existing data or modify structures
- `fix-*.sql` - Fix issues with database structure or data

## RLS (Row Level Security) Scripts

These scripts manage security policies:

- `enable-rls-for-all-tables.sql` - Enable RLS on all tables
- `add-client-id-to-page-analyses.sql` - Add client_id and update RLS policies
- `fix-rls-performance-issues.sql` - Optimize RLS policies for performance

## Utility Scripts

These scripts help with verification, checking, and diagnostics:

- `check-*.sql` - Check table structures or data
- `verify-*.sql` - Verify operations and security policies
- `diagnose-*.sql` - Diagnose issues and problems
- `list-*.sql` - List database objects or information

## Usage Guidelines

### Setting Up a New Environment

1. Run schema scripts first to create tables
2. Run migration scripts to update to the latest schema
3. Run RLS scripts to set up security policies

### Making Schema Changes

1. Create a new migration script using the naming convention `add-[feature].sql`
2. Test the script in development
3. Apply to production with appropriate backups

### Security Policy Updates

When updating RLS policies:
1. Always verify current policies first
2. Test new policies with realistic data volumes
3. Avoid complex multi-table JOINs in RLS policies
4. Include appropriate indexes for all foreign keys

### Performance Considerations

- Add appropriate indexes for any columns used in WHERE clauses
- Keep RLS policies simple (max 1 JOIN per policy)
- Use direct column lookups in RLS policies when possible
- Test with realistic data volumes

## Important Scripts

### Critical System Scripts

- `add-client-id-to-page-analyses.sql` - Implements efficient multi-tenant RLS
- `fix-rls-performance-issues.sql` - Resolves RLS performance issues
- `verify-page-analyses-rls.sql` - Verifies RLS policy performance

### Utility Scripts

- `verify-current-schema.sql` - Shows current database schema
- `check-supabase-status.sh` - Checks Supabase connection status
- `list-all-tables.sql` - Lists all tables in the database

## Script Naming Conventions

- `create-*.sql` - Create new tables or objects
- `add-*.sql` - Add new columns or features
- `update-*.sql` - Update existing data
- `fix-*.sql` - Fix issues
- `check-*.sql` - Check state or structure
- `verify-*.sql` - Verify operations
- `diagnose-*.sql` - Diagnose issues

---

Last updated: May 28, 2025