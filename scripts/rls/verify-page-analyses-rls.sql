-- Script to verify the RLS policies on page_analyses
-- Check table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'page_analyses' 
ORDER BY ordinal_position;

-- response 
[
  {
    "column_name": "id",
    "data_type": "uuid"
  },
  {
    "column_name": "query_id",
    "data_type": "uuid"
  },
  {
    "column_name": "page_analysis_id",
    "data_type": "text"
  },
  {
    "column_name": "citation_url",
    "data_type": "text"
  },
  {
    "column_name": "citation_position",
    "data_type": "integer"
  },
  {
    "column_name": "domain_name",
    "data_type": "text"
  },
  {
    "column_name": "is_client_domain",
    "data_type": "boolean"
  },
  {
    "column_name": "is_competitor_domain",
    "data_type": "boolean"
  },
  {
    "column_name": "mention_type",
    "data_type": "ARRAY"
  },
  {
    "column_name": "analysis_notes",
    "data_type": "text"
  },
  {
    "column_name": "technical_seo",
    "data_type": "jsonb"
  },
  {
    "column_name": "page_performance",
    "data_type": "jsonb"
  },
  {
    "column_name": "domain_authority",
    "data_type": "jsonb"
  },
  {
    "column_name": "on_page_seo",
    "data_type": "jsonb"
  },
  {
    "column_name": "content_quality",
    "data_type": "jsonb"
  },
  {
    "column_name": "page_analysis",
    "data_type": "jsonb"
  },
  {
    "column_name": "created_at",
    "data_type": "timestamp with time zone"
  },
  {
    "column_name": "brand_mentioned",
    "data_type": "boolean"
  },
  {
    "column_name": "page_title",
    "data_type": "text"
  },
  {
    "column_name": "brand_mention_count",
    "data_type": "integer"
  },
  {
    "column_name": "brand_in_title",
    "data_type": "boolean"
  },
  {
    "column_name": "competitor_mentioned",
    "data_type": "boolean"
  },
  {
    "column_name": "competitor_analysis",
    "data_type": "jsonb"
  },
  {
    "column_name": "competitor_names",
    "data_type": "ARRAY"
  },
  {
    "column_name": "brand_context",
    "data_type": "text"
  },
  {
    "column_name": "competitor_context",
    "data_type": "text"
  },
  {
    "column_name": "relevance_score",
    "data_type": "numeric"
  },
  {
    "column_name": "content_quality_score",
    "data_type": "numeric"
  },
  {
    "column_name": "query_keyword",
    "data_type": "text"
  },
  {
    "column_name": "query_text",
    "data_type": "text"
  },
  {
    "column_name": "crawl_error",
    "data_type": "text"
  },
  {
    "column_name": "client_id",
    "data_type": "uuid"
  }
]

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'page_analyses';

-- response

[
  {
    "tablename": "page_analyses",
    "rowsecurity": true
  }
]

-- View current RLS policies
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'page_analyses';

-- response 

[
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Client users can view page analyses for their assigned client",
    "cmd": "SELECT",
    "qual": "(client_id IN ( SELECT profiles.client_account_id\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'client'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Enable read access for authenticated users",
    "cmd": "SELECT",
    "qual": "(auth.role() = 'authenticated'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Partners can view page analyses for their clients",
    "cmd": "SELECT",
    "qual": "(client_id IN ( SELECT clients.id\n   FROM clients\n  WHERE ((clients.partner_id = auth.uid()) OR (clients.created_by = auth.uid()))))"
  },
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Service role can manage all page analyses",
    "cmd": "ALL",
    "qual": "(auth.role() = 'service_role'::text)"
  },
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Super admins can manage all page analyses",
    "cmd": "ALL",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Super admins can view all page analyses",
    "cmd": "SELECT",
    "qual": "(EXISTS ( SELECT 1\n   FROM profiles\n  WHERE ((profiles.id = auth.uid()) AND (profiles.role = 'super_admin'::text))))"
  },
  {
    "schemaname": "public",
    "tablename": "page_analyses",
    "policyname": "Users can create page analyses for their runs",
    "cmd": "INSERT",
    "qual": null
  }
]

-- Check performance of a common query
EXPLAIN (ANALYZE, COSTS, VERBOSE, BUFFERS, FORMAT JSON)
SELECT pa.*
FROM page_analyses pa
JOIN analysis_queries aq ON pa.query_id = aq.id
JOIN analysis_runs ar ON aq.analysis_run_id = ar.id
WHERE ar.client_id = '[REPLACE_WITH_CLIENT_ID]'
LIMIT 10;


-- response 

[
  {
    "QUERY PLAN": [
      {
        "Plan": {
          "Node Type": "Limit",
          "Parallel Aware": false,
          "Async Capable": false,
          "Startup Cost": 0.15,
          "Total Cost": 9.31,
          "Plan Rows": 10,
          "Plan Width": 1863,
          "Actual Startup Time": 0.028,
          "Actual Total Time": 0.053,
          "Actual Rows": 10,
          "Actual Loops": 1,
          "Output": [
            "pa.id",
            "pa.query_id",
            "pa.page_analysis_id",
            "pa.citation_url",
            "pa.citation_position",
            "pa.domain_name",
            "pa.is_client_domain",
            "pa.is_competitor_domain",
            "pa.mention_type",
            "pa.analysis_notes",
            "pa.technical_seo",
            "pa.page_performance",
            "pa.domain_authority",
            "pa.on_page_seo",
            "pa.content_quality",
            "pa.page_analysis",
            "pa.created_at",
            "pa.brand_mentioned",
            "pa.page_title",
            "pa.brand_mention_count",
            "pa.brand_in_title",
            "pa.competitor_mentioned",
            "pa.competitor_analysis",
            "pa.competitor_names",
            "pa.brand_context",
            "pa.competitor_context",
            "pa.relevance_score",
            "pa.content_quality_score",
            "pa.query_keyword",
            "pa.query_text",
            "pa.crawl_error",
            "pa.client_id"
          ],
          "Shared Hit Blocks": 8,
          "Shared Read Blocks": 0,
          "Shared Dirtied Blocks": 0,
          "Shared Written Blocks": 0,
          "Local Hit Blocks": 0,
          "Local Read Blocks": 0,
          "Local Dirtied Blocks": 0,
          "Local Written Blocks": 0,
          "Temp Read Blocks": 0,
          "Temp Written Blocks": 0,
          "Plans": [
            {
              "Node Type": "Nested Loop",
              "Parent Relationship": "Outer",
              "Parallel Aware": false,
              "Async Capable": false,
              "Join Type": "Inner",
              "Startup Cost": 0.15,
              "Total Cost": 44.13,
              "Plan Rows": 48,
              "Plan Width": 1863,
              "Actual Startup Time": 0.027,
              "Actual Total Time": 0.05,
              "Actual Rows": 10,
              "Actual Loops": 1,
              "Output": [
                "pa.id",
                "pa.query_id",
                "pa.page_analysis_id",
                "pa.citation_url",
                "pa.citation_position",
                "pa.domain_name",
                "pa.is_client_domain",
                "pa.is_competitor_domain",
                "pa.mention_type",
                "pa.analysis_notes",
                "pa.technical_seo",
                "pa.page_performance",
                "pa.domain_authority",
                "pa.on_page_seo",
                "pa.content_quality",
                "pa.page_analysis",
                "pa.created_at",
                "pa.brand_mentioned",
                "pa.page_title",
                "pa.brand_mention_count",
                "pa.brand_in_title",
                "pa.competitor_mentioned",
                "pa.competitor_analysis",
                "pa.competitor_names",
                "pa.brand_context",
                "pa.competitor_context",
                "pa.relevance_score",
                "pa.content_quality_score",
                "pa.query_keyword",
                "pa.query_text",
                "pa.crawl_error",
                "pa.client_id"
              ],
              "Inner Unique": false,
              "Join Filter": "(aq.analysis_run_id = ar.id)",
              "Rows Removed by Join Filter": 0,
              "Shared Hit Blocks": 8,
              "Shared Read Blocks": 0,
              "Shared Dirtied Blocks": 0,
              "Shared Written Blocks": 0,
              "Local Hit Blocks": 0,
              "Local Read Blocks": 0,
              "Local Dirtied Blocks": 0,
              "Local Written Blocks": 0,
              "Temp Read Blocks": 0,
              "Temp Written Blocks": 0,
              "Plans": [
                {
                  "Node Type": "Seq Scan",
                  "Parent Relationship": "Outer",
                  "Parallel Aware": false,
                  "Async Capable": false,
                  "Relation Name": "analysis_runs",
                  "Schema": "public",
                  "Alias": "ar",
                  "Startup Cost": 0,
                  "Total Cost": 1.01,
                  "Plan Rows": 1,
                  "Plan Width": 16,
                  "Actual Startup Time": 0.006,
                  "Actual Total Time": 0.006,
                  "Actual Rows": 1,
                  "Actual Loops": 1,
                  "Output": [
                    "ar.id"
                  ],
                  "Filter": "(ar.client_id = '9e752e81-62b3-4f44-b8b6-f706b2550b28'::uuid)",
                  "Rows Removed by Filter": 0,
                  "Shared Hit Blocks": 1,
                  "Shared Read Blocks": 0,
                  "Shared Dirtied Blocks": 0,
                  "Shared Written Blocks": 0,
                  "Local Hit Blocks": 0,
                  "Local Read Blocks": 0,
                  "Local Dirtied Blocks": 0,
                  "Local Written Blocks": 0,
                  "Temp Read Blocks": 0,
                  "Temp Written Blocks": 0
                },
                {
                  "Node Type": "Nested Loop",
                  "Parent Relationship": "Inner",
                  "Parallel Aware": false,
                  "Async Capable": false,
                  "Join Type": "Inner",
                  "Startup Cost": 0.15,
                  "Total Cost": 42.52,
                  "Plan Rows": 48,
                  "Plan Width": 1879,
                  "Actual Startup Time": 0.019,
                  "Actual Total Time": 0.04,
                  "Actual Rows": 10,
                  "Actual Loops": 1,
                  "Output": [
                    "pa.id",
                    "pa.query_id",
                    "pa.page_analysis_id",
                    "pa.citation_url",
                    "pa.citation_position",
                    "pa.domain_name",
                    "pa.is_client_domain",
                    "pa.is_competitor_domain",
                    "pa.mention_type",
                    "pa.analysis_notes",
                    "pa.technical_seo",
                    "pa.page_performance",
                    "pa.domain_authority",
                    "pa.on_page_seo",
                    "pa.content_quality",
                    "pa.page_analysis",
                    "pa.created_at",
                    "pa.brand_mentioned",
                    "pa.page_title",
                    "pa.brand_mention_count",
                    "pa.brand_in_title",
                    "pa.competitor_mentioned",
                    "pa.competitor_analysis",
                    "pa.competitor_names",
                    "pa.brand_context",
                    "pa.competitor_context",
                    "pa.relevance_score",
                    "pa.content_quality_score",
                    "pa.query_keyword",
                    "pa.query_text",
                    "pa.crawl_error",
                    "pa.client_id",
                    "aq.analysis_run_id"
                  ],
                  "Inner Unique": true,
                  "Shared Hit Blocks": 7,
                  "Shared Read Blocks": 0,
                  "Shared Dirtied Blocks": 0,
                  "Shared Written Blocks": 0,
                  "Local Hit Blocks": 0,
                  "Local Read Blocks": 0,
                  "Local Dirtied Blocks": 0,
                  "Local Written Blocks": 0,
                  "Temp Read Blocks": 0,
                  "Temp Written Blocks": 0,
                  "Plans": [
                    {
                      "Node Type": "Seq Scan",
                      "Parent Relationship": "Outer",
                      "Parallel Aware": false,
                      "Async Capable": false,
                      "Relation Name": "page_analyses",
                      "Schema": "public",
                      "Alias": "pa",
                      "Startup Cost": 0,
                      "Total Cost": 37.48,
                      "Plan Rows": 48,
                      "Plan Width": 1863,
                      "Actual Startup Time": 0.005,
                      "Actual Total Time": 0.018,
                      "Actual Rows": 10,
                      "Actual Loops": 1,
                      "Output": [
                        "pa.id",
                        "pa.query_id",
                        "pa.page_analysis_id",
                        "pa.citation_url",
                        "pa.citation_position",
                        "pa.domain_name",
                        "pa.is_client_domain",
                        "pa.is_competitor_domain",
                        "pa.mention_type",
                        "pa.analysis_notes",
                        "pa.technical_seo",
                        "pa.page_performance",
                        "pa.domain_authority",
                        "pa.on_page_seo",
                        "pa.content_quality",
                        "pa.page_analysis",
                        "pa.created_at",
                        "pa.brand_mentioned",
                        "pa.page_title",
                        "pa.brand_mention_count",
                        "pa.brand_in_title",
                        "pa.competitor_mentioned",
                        "pa.competitor_analysis",
                        "pa.competitor_names",
                        "pa.brand_context",
                        "pa.competitor_context",
                        "pa.relevance_score",
                        "pa.content_quality_score",
                        "pa.query_keyword",
                        "pa.query_text",
                        "pa.crawl_error",
                        "pa.client_id"
                      ],
                      "Shared Hit Blocks": 3,
                      "Shared Read Blocks": 0,
                      "Shared Dirtied Blocks": 0,
                      "Shared Written Blocks": 0,
                      "Local Hit Blocks": 0,
                      "Local Read Blocks": 0,
                      "Local Dirtied Blocks": 0,
                      "Local Written Blocks": 0,
                      "Temp Read Blocks": 0,
                      "Temp Written Blocks": 0
                    },
                    {
                      "Node Type": "Memoize",
                      "Parent Relationship": "Inner",
                      "Parallel Aware": false,
                      "Async Capable": false,
                      "Startup Cost": 0.15,
                      "Total Cost": 0.39,
                      "Plan Rows": 1,
                      "Plan Width": 32,
                      "Actual Startup Time": 0.002,
                      "Actual Total Time": 0.002,
                      "Actual Rows": 1,
                      "Actual Loops": 10,
                      "Output": [
                        "aq.id",
                        "aq.analysis_run_id"
                      ],
                      "Cache Key": "pa.query_id",
                      "Cache Mode": "logical",
                      "Cache Hits": 8,
                      "Cache Misses": 2,
                      "Cache Evictions": 0,
                      "Cache Overflows": 0,
                      "Peak Memory Usage": 1,
                      "Shared Hit Blocks": 4,
                      "Shared Read Blocks": 0,
                      "Shared Dirtied Blocks": 0,
                      "Shared Written Blocks": 0,
                      "Local Hit Blocks": 0,
                      "Local Read Blocks": 0,
                      "Local Dirtied Blocks": 0,
                      "Local Written Blocks": 0,
                      "Temp Read Blocks": 0,
                      "Temp Written Blocks": 0,
                      "Plans": [
                        {
                          "Node Type": "Index Scan",
                          "Parent Relationship": "Outer",
                          "Parallel Aware": false,
                          "Async Capable": false,
                          "Scan Direction": "Forward",
                          "Index Name": "analysis_queries_pkey",
                          "Relation Name": "analysis_queries",
                          "Schema": "public",
                          "Alias": "aq",
                          "Startup Cost": 0.14,
                          "Total Cost": 0.38,
                          "Plan Rows": 1,
                          "Plan Width": 32,
                          "Actual Startup Time": 0.005,
                          "Actual Total Time": 0.005,
                          "Actual Rows": 1,
                          "Actual Loops": 2,
                          "Output": [
                            "aq.id",
                            "aq.analysis_run_id"
                          ],
                          "Index Cond": "(aq.id = pa.query_id)",
                          "Rows Removed by Index Recheck": 0,
                          "Shared Hit Blocks": 4,
                          "Shared Read Blocks": 0,
                          "Shared Dirtied Blocks": 0,
                          "Shared Written Blocks": 0,
                          "Local Hit Blocks": 0,
                          "Local Read Blocks": 0,
                          "Local Dirtied Blocks": 0,
                          "Local Written Blocks": 0,
                          "Temp Read Blocks": 0,
                          "Temp Written Blocks": 0
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        "Query Identifier": -6287038771007450000,
        "Planning": {
          "Shared Hit Blocks": 581,
          "Shared Read Blocks": 0,
          "Shared Dirtied Blocks": 0,
          "Shared Written Blocks": 0,
          "Local Hit Blocks": 0,
          "Local Read Blocks": 0,
          "Local Dirtied Blocks": 0,
          "Local Written Blocks": 0,
          "Temp Read Blocks": 0,
          "Temp Written Blocks": 0
        },
        "Planning Time": 1.582,
        "Triggers": [],
        "Execution Time": 0.18
      }
    ]
  }
]