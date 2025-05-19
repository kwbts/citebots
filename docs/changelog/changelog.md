# Changelog

All notable changes to the Citebots project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.0] - 2025-01-18

### Added
- Added `associated_pages` JSONB column to `analysis_queries` table for storing page analysis results
- Created comprehensive documentation for edge functions API
- Added Supabase CLI development guide
- Created quick reference guide for common tasks
- Added current architecture and data model documentation

### Fixed
- Fixed page analysis data flow - citations are now properly analyzed and stored
- Enhanced edge function error handling with defensive programming
- Fixed array access issues causing "Cannot read properties of undefined" errors
- Resolved API key configuration issues in edge functions

### Changed
- Updated README.md to reflect current production status
- Improved edge function logging and error messages
- Standardized citation processing across all platforms

### Removed
- Removed backup and test files:
  - `v2-index.ts` backup in analyze-citation
  - `index-fixed.ts` backup in process-query
  - Debug SQL scripts no longer needed
  - Test shell scripts

### Security
- Improved input validation in edge functions
- Enhanced null/undefined checking throughout codebase

## [1.1.0] - 2025-01-15

### Added
- Competitor analysis functionality
- Enhanced client profiles with AI
- Batch analysis processing
- Real-time progress tracking

### Changed
- Improved citation extraction algorithms
- Enhanced SEO metric calculations

## [1.0.0] - 2025-01-10

### Added
- Initial production release
- User authentication system
- Client management
- Citation analysis with ChatGPT and Perplexity
- Web crawling with ScrapingBee
- Basic reporting features

### Security
- Implemented Row Level Security (RLS) on all tables
- Added JWT-based authentication
- Secured edge functions with service role keys

---

[Unreleased]: https://github.com/[your-repo]/kb-citebots/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/[your-repo]/kb-citebots/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/[your-repo]/kb-citebots/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/[your-repo]/kb-citebots/releases/tag/v1.0.0