-- COMPREHENSIVE DIAGNOSIS - Run these queries and add responses

-- =============== TIMEOUT CONFIGURATION ===============

-- 1. Check if our role timeout changes took effect
SELECT 
  rolname,
  rolconfig
FROM pg_roles 
WHERE rolname IN ('service_role', 'authenticated', 'analysis_processor')
ORDER BY rolname;

-- response

[
  {
    "rolname": "authenticated",
    "rolconfig": [
      "statement_timeout=8s"
    ]
  },
  {
    "rolname": "service_role",
    "rolconfig": [
      "statement_timeout=300s"
    ]
  }
]


-- 2. Force apply timeout changes for current session
SET statement_timeout = '300s';
ALTER ROLE service_role SET statement_timeout = '300s';
SELECT 'Timeout settings applied' as status;

-- 3. Verify current session timeout
SHOW statement_timeout;

-- response

[
  {
    "statement_timeout": "2min"
  }
]

-- =============== RECENT ANALYSIS STATUS ===============

-- 4. Check all recent analysis runs (last 2 hours)
SELECT 
  ar.id,
  ar.batch_id,
  ar.status,
  ar.queries_total,
  ar.queries_completed,
  ar.queries_queued,
  ar.queries_processing,
  ar.queries_failed,
  ar.created_at,
  ar.updated_at,
  ROUND(EXTRACT(EPOCH FROM (COALESCE(ar.updated_at, NOW()) - ar.created_at)) / 60, 2) as runtime_minutes,
  CASE 
    WHEN ar.status = 'running' AND ar.updated_at < NOW() - INTERVAL '10 minutes' 
    THEN 'STALLED' 
    WHEN ar.status = 'running' 
    THEN 'ACTIVE'
    ELSE ar.status
  END as health_status
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '2 hours'
ORDER BY ar.created_at DESC;

-- results

[
  {
    "id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "batch_id": "custom_both_1748041134121",
    "status": "running",
    "queries_total": 24,
    "queries_completed": 9,
    "queries_queued": 0,
    "queries_processing": 15,
    "queries_failed": 0,
    "created_at": "2025-05-23 22:58:54.157054+00",
    "updated_at": "2025-05-23 23:02:14.227242+00",
    "runtime_minutes": "3.33",
    "health_status": "ACTIVE"
  },
  {
    "id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "batch_id": "custom_both_1748040984094",
    "status": "running",
    "queries_total": 24,
    "queries_completed": 9,
    "queries_queued": 0,
    "queries_processing": 15,
    "queries_failed": 0,
    "created_at": "2025-05-23 22:56:24.218782+00",
    "updated_at": "2025-05-23 22:59:44.509416+00",
    "runtime_minutes": "3.34",
    "health_status": "ACTIVE"
  }
]

-- =============== QUEUE HEALTH CHECK ===============

-- 5. Queue status summary by analysis run
SELECT 
  aq.analysis_run_id,
  aq.status,
  COUNT(*) as count,
  MIN(aq.created_at) as first_item,
  MAX(aq.updated_at) as last_updated,
  MAX(aq.attempts) as max_attempts_used,
  COUNT(CASE WHEN aq.error_message IS NOT NULL THEN 1 END) as error_count
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '2 hours'
)
GROUP BY aq.analysis_run_id, aq.status
ORDER BY aq.analysis_run_id, aq.status;

-- responses

[
  {
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "completed",
    "count": 9,
    "first_item": "2025-05-23 22:56:24.266+00",
    "last_updated": "2025-05-23 22:56:26.588665+00",
    "max_attempts_used": 1,
    "error_count": 0
  },
  {
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "processing",
    "count": 15,
    "first_item": "2025-05-23 22:56:24.552+00",
    "last_updated": "2025-05-23 22:56:26.588665+00",
    "max_attempts_used": 1,
    "error_count": 0
  },
  {
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "count": 9,
    "first_item": "2025-05-23 22:58:54.186+00",
    "last_updated": "2025-05-23 22:58:56.344673+00",
    "max_attempts_used": 1,
    "error_count": 0
  },
  {
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "count": 15,
    "first_item": "2025-05-23 22:58:54.4+00",
    "last_updated": "2025-05-23 22:58:56.344673+00",
    "max_attempts_used": 1,
    "error_count": 0
  }
]

-- 6. Check for stuck or problematic queue items
SELECT 
  aq.id,
  aq.analysis_run_id,
  aq.status,
  aq.attempts,
  aq.max_attempts,
  aq.processor_id,
  aq.error_message,
  aq.created_at,
  aq.started_at,
  aq.completed_at,
  CASE 
    WHEN aq.status = 'processing' AND aq.started_at < NOW() - INTERVAL '5 minutes'
    THEN 'TIMEOUT_LIKELY'
    WHEN aq.status = 'pending' AND aq.created_at < NOW() - INTERVAL '15 minutes'
    THEN 'STUCK_PENDING'
    WHEN aq.attempts >= aq.max_attempts
    THEN 'MAX_ATTEMPTS_REACHED'
    ELSE 'NORMAL'
  END as issue_type,
  ROUND(EXTRACT(EPOCH FROM (NOW() - COALESCE(aq.started_at, aq.created_at))) / 60, 2) as age_minutes
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '2 hours'
)
AND (
  aq.status IN ('processing', 'pending', 'failed') 
  OR aq.completed_at > NOW() - INTERVAL '1 hour'
)
ORDER BY aq.created_at DESC
LIMIT 30;

-- responses

[
  {
    "id": "747c0267-1456-4b44-a7a7-4ac03706b8bc",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ff7e2398-54f9-4a70-8b7b-d6eb575ec0d5",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.915+00",
    "started_at": "2025-05-23 22:58:56.344673+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "d7fa7b2e-2555-4b33-8e0d-6323186397c3",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ff7e2398-54f9-4a70-8b7b-d6eb575ec0d5",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.85+00",
    "started_at": "2025-05-23 22:58:56.344673+00",
    "completed_at": "2025-05-23 23:02:08.335+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "c4eb8b1b-991c-4602-b7cb-ae1dbf6a05a8",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ff7e2398-54f9-4a70-8b7b-d6eb575ec0d5",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.785+00",
    "started_at": "2025-05-23 22:58:56.344673+00",
    "completed_at": "2025-05-23 23:00:28.64+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "a8fa4f70-4c4c-4b73-b857-3e1865311055",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ff7e2398-54f9-4a70-8b7b-d6eb575ec0d5",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.719+00",
    "started_at": "2025-05-23 22:58:56.344673+00",
    "completed_at": "2025-05-23 22:59:55.156+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "d41f0db9-8307-4c8f-96e3-4251cb61e213",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.64+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "c18980fa-2e8b-4b91-a111-ab468d324759",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.563+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "5624a82f-207c-43f2-aa56-28d0a01d726c",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.487+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "cedb3836-1b20-4279-a30e-e0c4e6e1b2c1",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.417+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "88df4fde-3269-4a08-aa1d-f2cb59e90168",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.35+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "4524bc06-d39d-4192-9c78-f690a965706c",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.277+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "128024da-41d2-4cd6-b10a-c0cd66fa5963",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.197+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "1ce53b27-1d7c-4ee8-8f3a-8f77c0b51974",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.129+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": "2025-05-23 23:01:56.723+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "d86e976f-54bb-4027-a1d9-0e5ff84f9667",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:55.058+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": "2025-05-23 23:00:51.247+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "2a08dc2d-6961-4074-9f9b-16dcc193bad9",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "01a3c496-e11d-4a54-b252-5f9c3c52cbe9",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.991+00",
    "started_at": "2025-05-23 22:58:56.26771+00",
    "completed_at": "2025-05-23 22:59:19.973+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "55283e2c-c9bc-4ca7-aeae-229098ab9402",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.917+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "c4753c85-1dbb-40a8-98a0-23bb68a6c06f",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.848+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "9f0697dc-eb05-4eab-b930-443f3e198665",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.775+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "30ead5f9-eb0d-4e46-9c9d-26654250882b",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.708+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "7d35996d-eed2-45dc-80b4-48463aeba51c",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.636+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "0901bd6f-b900-4f50-b607-5dd96d6819f8",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.478+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "54fe27d8-fd45-4eda-8faa-b661dedfd838",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.4+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "5.70"
  },
  {
    "id": "a2e5c45d-ef28-4c01-bbf9-b13b4085a702",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.332+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": "2025-05-23 23:02:13.977+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "e6a7f7d5-4161-4699-ac0b-af03a9eb9625",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.262+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": "2025-05-23 23:01:05.224+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "288c7c46-3b6b-4812-8e34-0bdacb602e0f",
    "analysis_run_id": "1ab40084-a9a5-49c5-9f3d-b7fdc4383b12",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "60d71adb-8382-4a3b-9e19-65515c5c4b73",
    "error_message": null,
    "created_at": "2025-05-23 22:58:54.186+00",
    "started_at": "2025-05-23 22:58:56.252245+00",
    "completed_at": "2025-05-23 23:00:39.505+00",
    "issue_type": "NORMAL",
    "age_minutes": "5.70"
  },
  {
    "id": "7ac8ced2-3be8-403e-880e-d4d30e6a6913",
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ee708194-12e9-4833-b52a-3fb8ec286305",
    "error_message": null,
    "created_at": "2025-05-23 22:56:25.838+00",
    "started_at": "2025-05-23 22:56:26.588665+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "8.20"
  },
  {
    "id": "f81e4ebc-c9b8-499e-bb48-971936905773",
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ee708194-12e9-4833-b52a-3fb8ec286305",
    "error_message": null,
    "created_at": "2025-05-23 22:56:25.773+00",
    "started_at": "2025-05-23 22:56:26.588665+00",
    "completed_at": "2025-05-23 22:59:11.643+00",
    "issue_type": "NORMAL",
    "age_minutes": "8.20"
  },
  {
    "id": "46623d61-b9e9-4dd9-b28c-ccfd4ebd9789",
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ee708194-12e9-4833-b52a-3fb8ec286305",
    "error_message": null,
    "created_at": "2025-05-23 22:56:25.71+00",
    "started_at": "2025-05-23 22:56:26.588665+00",
    "completed_at": "2025-05-23 22:58:15.511+00",
    "issue_type": "NORMAL",
    "age_minutes": "8.20"
  },
  {
    "id": "89b6fce9-c57d-4c4a-9490-f3f5f0e54fcc",
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "completed",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "ee708194-12e9-4833-b52a-3fb8ec286305",
    "error_message": null,
    "created_at": "2025-05-23 22:56:25.644+00",
    "started_at": "2025-05-23 22:56:26.588665+00",
    "completed_at": "2025-05-23 22:57:30.616+00",
    "issue_type": "NORMAL",
    "age_minutes": "8.20"
  },
  {
    "id": "f805d72d-d010-4a42-a438-e5de8a331b83",
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "c07f75fa-ea6a-4b51-859c-14b8e1b6b004",
    "error_message": null,
    "created_at": "2025-05-23 22:56:25.579+00",
    "started_at": "2025-05-23 22:56:26.432295+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "8.20"
  },
  {
    "id": "0ef6e395-81b7-4e5c-b760-f4e7c57e4cc8",
    "analysis_run_id": "0e4167c5-5794-4836-a508-9a0e048caa78",
    "status": "processing",
    "attempts": 1,
    "max_attempts": 3,
    "processor_id": "c07f75fa-ea6a-4b51-859c-14b8e1b6b004",
    "error_message": null,
    "created_at": "2025-05-23 22:56:25.514+00",
    "started_at": "2025-05-23 22:56:26.432295+00",
    "completed_at": null,
    "issue_type": "TIMEOUT_LIKELY",
    "age_minutes": "8.20"
  }
]

-- =============== FUNCTION AVAILABILITY CHECK ===============

-- 7. Check if our optimized functions exist and are callable
SELECT 
  proname as function_name,
  prosrc IS NOT NULL as has_source,
  proacl as permissions
FROM pg_proc 
WHERE proname IN ('claim_queue_batch_optimized', 'reset_stuck_queue_items', 'claim_queue_batch')
ORDER BY proname;

-- response

[
  {
    "function_name": "claim_queue_batch",
    "has_source": true,
    "permissions": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"
  },
  {
    "function_name": "claim_queue_batch_optimized",
    "has_source": true,
    "permissions": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"
  },
  {
    "function_name": "reset_stuck_queue_items",
    "has_source": true,
    "permissions": "{=X/postgres,postgres=X/postgres,anon=X/postgres,authenticated=X/postgres,service_role=X/postgres}"
  }
]

-- 8. Test the optimized batch claiming function
SELECT 'Testing optimized batch function...' as test_status;
-- Note: Don't actually call it here as it would claim items

-- =============== ACTIVE PROCESSES CHECK ===============

-- 9. Check for any currently running database operations
SELECT 
  pid,
  state,
  application_name,
  query_start,
  ROUND(EXTRACT(EPOCH FROM (NOW() - query_start)), 2) as duration_seconds,
  wait_event_type,
  wait_event,
  LEFT(query, 150) as query_preview
FROM pg_stat_activity 
WHERE state != 'idle' 
  AND application_name != 'Supabase Auth'
  AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- =============== ERROR ANALYSIS ===============

-- 10. Check common error patterns in queue
SELECT 
  error_message,
  COUNT(*) as error_count,
  MAX(aq.updated_at) as last_occurrence,
  array_agg(DISTINCT aq.analysis_run_id) as affected_runs
FROM analysis_queue aq
WHERE aq.error_message IS NOT NULL
  AND aq.created_at > NOW() - INTERVAL '2 hours'
GROUP BY error_message
ORDER BY error_count DESC, last_occurrence DESC;

-- =============== PERFORMANCE METRICS ===============

-- 11. Check average processing times
SELECT 
  ar.id as analysis_run_id,
  COUNT(aq.id) as total_items,
  COUNT(CASE WHEN aq.status = 'completed' THEN 1 END) as completed_items,
  COUNT(CASE WHEN aq.status = 'failed' THEN 1 END) as failed_items,
  COUNT(CASE WHEN aq.status = 'processing' THEN 1 END) as processing_items,
  COUNT(CASE WHEN aq.status = 'pending' THEN 1 END) as pending_items,
  ROUND(AVG(EXTRACT(EPOCH FROM (aq.completed_at - aq.started_at))), 2) as avg_processing_seconds,
  ROUND(MAX(EXTRACT(EPOCH FROM (aq.completed_at - aq.started_at))), 2) as max_processing_seconds
FROM analysis_runs ar
LEFT JOIN analysis_queue aq ON ar.id = aq.analysis_run_id
WHERE ar.created_at > NOW() - INTERVAL '2 hours'
GROUP BY ar.id
ORDER BY ar.created_at DESC;

-- =============== IMMEDIATE FIXES ===============

-- 12. Reset any stuck processing items (run this if needed)
SELECT 'Ready to reset stuck items...' as reset_status;
-- Uncomment the next line if you want to reset stuck items:
-- SELECT reset_stuck_queue_items() as items_reset;

-- 13. Check if continuation logic is working
SELECT 
  'Checking for items that should trigger continuation...' as check_status,
  COUNT(*) as pending_items_under_max_attempts
FROM analysis_queue aq
WHERE aq.status = 'pending'
  AND aq.attempts < aq.max_attempts
  AND aq.created_at > NOW() - INTERVAL '2 hours';

-- =============== SUMMARY STATUS ===============

-- 14. Overall system health summary
SELECT 
  'SYSTEM HEALTH SUMMARY' as report_type,
  COUNT(DISTINCT ar.id) as total_recent_runs,
  COUNT(DISTINCT CASE WHEN ar.status = 'completed' THEN ar.id END) as completed_runs,
  COUNT(DISTINCT CASE WHEN ar.status = 'running' THEN ar.id END) as running_runs,
  COUNT(DISTINCT CASE WHEN ar.status = 'failed' THEN ar.id END) as failed_runs,
  SUM(ar.queries_total) as total_queries_submitted,
  SUM(ar.queries_completed) as total_queries_completed,
  ROUND(
    100.0 * SUM(ar.queries_completed) / NULLIF(SUM(ar.queries_total), 0), 
    2
  ) as completion_percentage
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '2 hours';