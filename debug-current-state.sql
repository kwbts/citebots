-- Debug current state after Phase 1 deployment

-- 1. Check recent analysis runs (last hour)
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
  ar.processing_method
FROM analysis_runs ar
WHERE ar.created_at > NOW() - INTERVAL '3 hour'
ORDER BY ar.created_at DESC;

-- Response

[
  {
    "id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "batch_id": "custom_both_1748000890716",
    "status": "running",
    "queries_total": 40,
    "queries_completed": 7,
    "queries_queued": 0,
    "queries_processing": 33,
    "queries_failed": 0,
    "created_at": "2025-05-23 11:48:10.766608+00",
    "processing_method": "queue"
  },
  {
    "id": "41301c14-d3bd-477d-8526-a19946decf93",
    "batch_id": "custom_both_1748000740387",
    "status": "running",
    "queries_total": 40,
    "queries_completed": 14,
    "queries_queued": 0,
    "queries_processing": 26,
    "queries_failed": 0,
    "created_at": "2025-05-23 11:45:40.433955+00",
    "processing_method": "queue"
  },
  {
    "id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "batch_id": "custom_both_1747999969184",
    "status": "running",
    "queries_total": 20,
    "queries_completed": 12,
    "queries_queued": 0,
    "queries_processing": 8,
    "queries_failed": 0,
    "created_at": "2025-05-23 11:32:49.229617+00",
    "processing_method": "queue"
  },
  {
    "id": "490d5084-1dc2-495c-b40a-61c086e37e4d",
    "batch_id": "custom_both_1747999188859",
    "status": "completed",
    "queries_total": 50,
    "queries_completed": 50,
    "queries_queued": 0,
    "queries_processing": 0,
    "queries_failed": 0,
    "created_at": "2025-05-23 11:19:48.892102+00",
    "processing_method": "queue"
  }
]

-- 2. Check queue status for recent runs
SELECT 
  aq.analysis_run_id,
  aq.status,
  COUNT(*) as count,
  MIN(aq.created_at) as first_item,
  MAX(aq.completed_at) as last_completed,
  MAX(aq.attempts) as max_attempts_used
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '3 hour'
)
GROUP BY aq.analysis_run_id, aq.status
ORDER BY aq.analysis_run_id, aq.status;

-- Response

[
  {
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "completed",
    "count": 7,
    "first_item": "2025-05-23 11:48:10.807+00",
    "last_completed": "2025-05-23 11:54:04.784+00",
    "max_attempts_used": 1
  },
  {
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "count": 33,
    "first_item": "2025-05-23 11:48:10.949+00",
    "last_completed": null,
    "max_attempts_used": 1
  },
  {
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "completed",
    "count": 14,
    "first_item": "2025-05-23 11:45:40.47+00",
    "last_completed": "2025-05-23 11:50:31.274+00",
    "max_attempts_used": 1
  },
  {
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "count": 26,
    "first_item": "2025-05-23 11:45:40.789+00",
    "last_completed": null,
    "max_attempts_used": 1
  },
  {
    "analysis_run_id": "490d5084-1dc2-495c-b40a-61c086e37e4d",
    "status": "completed",
    "count": 50,
    "first_item": "2025-05-23 11:19:48.928+00",
    "last_completed": "2025-05-23 11:35:43.425+00",
    "max_attempts_used": 2
  },
  {
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "completed",
    "count": 12,
    "first_item": "2025-05-23 11:32:49.267+00",
    "last_completed": "2025-05-23 11:47:41.094+00",
    "max_attempts_used": 1
  },
  {
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "count": 8,
    "first_item": "2025-05-23 11:32:50.035+00",
    "last_completed": null,
    "max_attempts_used": 1
  }
]

-- 3. Check for duplicate batch_ids (indicates duplicate runs)
SELECT 
  batch_id,
  COUNT(*) as run_count,
  array_agg(id) as run_ids,
  array_agg(created_at) as created_times
FROM analysis_runs 
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY batch_id
HAVING COUNT(*) > 1;

-- Response

Success. No rows returned




-- 4. Check queue items that failed or got stuck
SELECT 
  aq.id,
  aq.analysis_run_id,
  aq.status,
  aq.attempts,
  aq.error_message,
  aq.created_at,
  aq.completed_at,
  (aq.query_data->>'query_text')::text as query_text
FROM analysis_queue aq
WHERE aq.analysis_run_id IN (
  SELECT ar.id FROM analysis_runs ar 
  WHERE ar.created_at > NOW() - INTERVAL '3 hour'
)
AND (aq.status IN ('failed', 'processing') OR aq.attempts >= 3)
ORDER BY aq.analysis_run_id, aq.created_at;

--Response 

[
  {
    "id": "61aa8608-be73-4af9-98af-daa0495827a4",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:10.949+00",
    "completed_at": null,
    "query_text": "How does Crash Plan's cyber resilience compare to other backup services?"
  },
  {
    "id": "75e9bead-ce92-4069-a41a-7137c98d9d2d",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.017+00",
    "completed_at": null,
    "query_text": "How does Crash Plan's cyber resilience compare to other backup services?"
  },
  {
    "id": "20605858-7170-4f0b-b4db-1bd061691c69",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.176+00",
    "completed_at": null,
    "query_text": "Recommendations for secure cloud storage with unlimited capacity"
  },
  {
    "id": "45db3fbd-9fdc-4402-8a36-e14fe3ca648f",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.248+00",
    "completed_at": null,
    "query_text": "Recommendations for secure cloud storage with unlimited capacity"
  },
  {
    "id": "6472ce04-3a81-4678-bbf9-cb82270dc0e6",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.36+00",
    "completed_at": null,
    "query_text": "What are some reliable and scalable backup solutions for large enterprises?"
  },
  {
    "id": "d5e965be-39f1-4416-a8eb-7654db0767df",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.424+00",
    "completed_at": null,
    "query_text": "What are some reliable and scalable backup solutions for large enterprises?"
  },
  {
    "id": "d9d41934-4806-4ced-8f99-40b1ac0e721a",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.489+00",
    "completed_at": null,
    "query_text": "Which backup solution offers the best user-centric control and integrated governance?"
  },
  {
    "id": "03d1e84f-a673-4d06-876f-78edbd66a367",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.766+00",
    "completed_at": null,
    "query_text": "What are the advantages of Crash Plan's cloud infrastructure over other options?"
  },
  {
    "id": "d13a6b7a-a165-4a1c-b7c9-90a6b4ef5202",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.832+00",
    "completed_at": null,
    "query_text": "What are the advantages of Crash Plan's cloud infrastructure over other options?"
  },
  {
    "id": "a845e3f9-2479-4eb3-a027-ddb014075e67",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.897+00",
    "completed_at": null,
    "query_text": "Can Crash Plan's unlimited storage compete with other enterprise backup solutions?"
  },
  {
    "id": "c4e345e1-61eb-4120-be44-1225a17c701d",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:11.97+00",
    "completed_at": null,
    "query_text": "Can Crash Plan's unlimited storage compete with other enterprise backup solutions?"
  },
  {
    "id": "e624640a-1911-487a-b456-7d9447daefdc",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.039+00",
    "completed_at": null,
    "query_text": "How well does Crash Plan's cyber resilience integrate compared to other data protection services?"
  },
  {
    "id": "6f462178-3446-4353-86a1-51d3723433de",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.105+00",
    "completed_at": null,
    "query_text": "How well does Crash Plan's cyber resilience integrate compared to other data protection services?"
  },
  {
    "id": "0ed817b9-8baf-4b1f-a787-faf7626d8570",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.172+00",
    "completed_at": null,
    "query_text": "What makes Crash Plan's partner onboarding process faster than other backup management services?"
  },
  {
    "id": "801bf3e6-ea74-4c6d-b801-9a0dd3e65224",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.239+00",
    "completed_at": null,
    "query_text": "What makes Crash Plan's partner onboarding process faster than other backup management services?"
  },
  {
    "id": "697e8dca-ca67-4e13-9d01-a8e2c8d0b897",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.305+00",
    "completed_at": null,
    "query_text": "What is the best One Drive recovery solution for small businesses?"
  },
  {
    "id": "c66e35f1-1ba2-4508-a769-007a718e34da",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.379+00",
    "completed_at": null,
    "query_text": "What is the best One Drive recovery solution for small businesses?"
  },
  {
    "id": "949e7715-5ef1-4858-a330-a08c28dd7b59",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.451+00",
    "completed_at": null,
    "query_text": "How reliable is Crash Plan for One Drive recovery?"
  },
  {
    "id": "6412eb34-76c9-4f9d-9b30-428602e45b2e",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.518+00",
    "completed_at": null,
    "query_text": "How reliable is Crash Plan for One Drive recovery?"
  },
  {
    "id": "3c6b3f39-b940-4618-af11-6a8c1655830c",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.583+00",
    "completed_at": null,
    "query_text": "Can you recommend a secure One Drive recovery solution for a large enterprise?"
  },
  {
    "id": "a72541c3-1c44-464f-a8f6-f28138a417d9",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.651+00",
    "completed_at": null,
    "query_text": "Can you recommend a secure One Drive recovery solution for a large enterprise?"
  },
  {
    "id": "12bb6e4b-0273-4deb-b308-677683c78735",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.723+00",
    "completed_at": null,
    "query_text": "What are the best options for One Drive recovery with unlimited storage?"
  },
  {
    "id": "c0702364-a8a1-48d3-ad10-615d87af1a2d",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.788+00",
    "completed_at": null,
    "query_text": "What are the best options for One Drive recovery with unlimited storage?"
  },
  {
    "id": "177aa48c-44f7-4b75-9b8a-f5386b4ae96e",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:12.854+00",
    "completed_at": null,
    "query_text": "I'm an IT professional looking for a One Drive recovery solution with user empowerment features, any suggestions?"
  },
  {
    "id": "da796510-5e2e-4700-bfa7-e1ff4a1461d0",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.043+00",
    "completed_at": null,
    "query_text": "How does Crash Plan compare to One Drive for business backup solutions?"
  },
  {
    "id": "9ba6b04d-9d3d-4b06-a846-35f2035c2c7c",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.11+00",
    "completed_at": null,
    "query_text": "What are the key differences between Crash Plan and One Drive for data recovery?"
  },
  {
    "id": "db8d6bb8-85f8-4d2b-96f0-d9d2cc76a14d",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.182+00",
    "completed_at": null,
    "query_text": "What are the key differences between Crash Plan and One Drive for data recovery?"
  },
  {
    "id": "d7af6252-a9cc-4087-9d62-aa8f835e2c71",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.249+00",
    "completed_at": null,
    "query_text": "Is Crash Plan or One Drive better for small business backup needs?"
  },
  {
    "id": "5f680dd0-7aab-45c8-bc65-156afdc70fdd",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.313+00",
    "completed_at": null,
    "query_text": "Is Crash Plan or One Drive better for small business backup needs?"
  },
  {
    "id": "ea1ea642-3781-4836-8c3c-6c5560e16f91",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.38+00",
    "completed_at": null,
    "query_text": "Crash Plan vs One Drive: which offers better cybersecurity resilience?"
  },
  {
    "id": "0cca426d-e12a-43a5-a92a-acf5c2f5c1ce",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.441+00",
    "completed_at": null,
    "query_text": "Crash Plan vs One Drive: which offers better cybersecurity resilience?"
  },
  {
    "id": "5ae9d82d-3708-49bf-a1bb-ef25fff4d8c8",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.506+00",
    "completed_at": null,
    "query_text": "Can Crash Plan offer more reliable recovery options than One Drive for enterprise protection?"
  },
  {
    "id": "3758bede-19d9-4066-8c63-3bb11839e006",
    "analysis_run_id": "0ee02dd2-3297-4712-a6dd-198c51713495",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:48:13.571+00",
    "completed_at": null,
    "query_text": "Can Crash Plan offer more reliable recovery options than One Drive for enterprise protection?"
  },
  {
    "id": "f9865184-4b20-44c4-8126-051b463badfd",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:40.789+00",
    "completed_at": null,
    "query_text": "Recommendations for secure cloud storage with unlimited capacity"
  },
  {
    "id": "0f8c81c3-c359-48ef-88c1-dc8b9dd92585",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:40.865+00",
    "completed_at": null,
    "query_text": "Recommendations for secure cloud storage with unlimited capacity"
  },
  {
    "id": "eb54b1fc-fa02-4b01-b804-e0f092de8c30",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:40.951+00",
    "completed_at": null,
    "query_text": "What are some reliable and scalable backup solutions for large enterprises?"
  },
  {
    "id": "a33239d5-e668-4808-9d2f-8965df6ae08a",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.018+00",
    "completed_at": null,
    "query_text": "What are some reliable and scalable backup solutions for large enterprises?"
  },
  {
    "id": "d29c81e7-8cae-415b-8587-10ed18d9acbe",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.082+00",
    "completed_at": null,
    "query_text": "Which backup solution offers the best user-centric control and integrated governance?"
  },
  {
    "id": "51379120-f5c7-4b3c-bbec-25db39dca9e3",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.353+00",
    "completed_at": null,
    "query_text": "What are the advantages of Crash Plan's cloud infrastructure over other options?"
  },
  {
    "id": "d5cf6e64-2f1d-465e-874f-2ab82cb3f57e",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.427+00",
    "completed_at": null,
    "query_text": "What are the advantages of Crash Plan's cloud infrastructure over other options?"
  },
  {
    "id": "1454f5b9-059c-4dcd-aded-585fc929289d",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.502+00",
    "completed_at": null,
    "query_text": "Can Crash Plan's unlimited storage compete with other enterprise backup solutions?"
  },
  {
    "id": "5132f659-45ab-4f37-a1f3-89583866b035",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.572+00",
    "completed_at": null,
    "query_text": "Can Crash Plan's unlimited storage compete with other enterprise backup solutions?"
  },
  {
    "id": "ea26a5cf-a4cb-41a5-b47f-66eaf916462e",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.637+00",
    "completed_at": null,
    "query_text": "How well does Crash Plan's cyber resilience integrate compared to other data protection services?"
  },
  {
    "id": "6ec4ea3d-5945-4557-99b5-ae882d2ec067",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.703+00",
    "completed_at": null,
    "query_text": "How well does Crash Plan's cyber resilience integrate compared to other data protection services?"
  },
  {
    "id": "6507f7cb-7b1f-4deb-bebb-eb59f84bb8b7",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:41.767+00",
    "completed_at": null,
    "query_text": "What makes Crash Plan's partner onboarding process faster than other backup management services?"
  },
  {
    "id": "878c91b5-6cb3-451f-9ce9-fbaa3b783543",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.032+00",
    "completed_at": null,
    "query_text": "How reliable is Crash Plan for One Drive recovery?"
  },
  {
    "id": "fcf2ef20-27cc-4e30-881a-17e1a8b570e4",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.098+00",
    "completed_at": null,
    "query_text": "How reliable is Crash Plan for One Drive recovery?"
  },
  {
    "id": "9ea03952-a807-4865-932e-37f53cd704aa",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.169+00",
    "completed_at": null,
    "query_text": "Can you recommend a secure One Drive recovery solution for a large enterprise?"
  },
  {
    "id": "b4d098c9-7edd-461a-8468-ba5d2e81bd71",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.239+00",
    "completed_at": null,
    "query_text": "Can you recommend a secure One Drive recovery solution for a large enterprise?"
  },
  {
    "id": "e35619d5-0cc2-4912-a3a7-af2fce83177c",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.308+00",
    "completed_at": null,
    "query_text": "What are the best options for One Drive recovery with unlimited storage?"
  },
  {
    "id": "9798e99f-7df0-41ac-8b52-a061a7906033",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.378+00",
    "completed_at": null,
    "query_text": "What are the best options for One Drive recovery with unlimited storage?"
  },
  {
    "id": "ef34a26c-82b1-4bf5-9da9-aa72160198e2",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.457+00",
    "completed_at": null,
    "query_text": "I'm an IT professional looking for a One Drive recovery solution with user empowerment features, any suggestions?"
  },
  {
    "id": "057e552a-cf03-4b7b-bc01-88b45d3fa46e",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.71+00",
    "completed_at": null,
    "query_text": "What are the key differences between Crash Plan and One Drive for data recovery?"
  },
  {
    "id": "1e55b825-3654-440b-807b-0ccd8b83defc",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.775+00",
    "completed_at": null,
    "query_text": "What are the key differences between Crash Plan and One Drive for data recovery?"
  },
  {
    "id": "3db236fc-18e6-492b-9a9a-7724dc19ee7b",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.836+00",
    "completed_at": null,
    "query_text": "Is Crash Plan or One Drive better for small business backup needs?"
  },
  {
    "id": "818dc6ee-ffbd-468d-a455-374e98ce9286",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.901+00",
    "completed_at": null,
    "query_text": "Is Crash Plan or One Drive better for small business backup needs?"
  },
  {
    "id": "68951b8e-32cd-454b-89c5-1c4c459216ad",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:42.967+00",
    "completed_at": null,
    "query_text": "Crash Plan vs One Drive: which offers better cybersecurity resilience?"
  },
  {
    "id": "375ed730-6c28-4964-b920-e04db6f74cf6",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:43.028+00",
    "completed_at": null,
    "query_text": "Crash Plan vs One Drive: which offers better cybersecurity resilience?"
  },
  {
    "id": "67e8779f-cd48-4146-beca-a3d485be01c6",
    "analysis_run_id": "41301c14-d3bd-477d-8526-a19946decf93",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:45:43.091+00",
    "completed_at": null,
    "query_text": "Can Crash Plan offer more reliable recovery options than One Drive for enterprise protection?"
  },
  {
    "id": "2abc16c9-591c-4e0a-9fe9-767011287e99",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.035+00",
    "completed_at": null,
    "query_text": "How does Crash Plan compare to other data backup solutions for small businesses?"
  },
  {
    "id": "fd29f7c2-ac8f-4e62-a967-d65704a5d8c1",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.098+00",
    "completed_at": null,
    "query_text": "What makes Crash Plan's cyber resilience platform superior to other options?"
  },
  {
    "id": "c8e7a2c1-eaba-49ba-89a0-0f6bc1ac0563",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.16+00",
    "completed_at": null,
    "query_text": "What makes Crash Plan's cyber resilience platform superior to other options?"
  },
  {
    "id": "ff89aab0-c2b7-45f9-82df-9fd88de33d39",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.223+00",
    "completed_at": null,
    "query_text": "Can you compare Crash Plan's unlimited storage feature with competitors?"
  },
  {
    "id": "883f20a6-fc3a-4bb5-9a10-1c20ac2e426c",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.292+00",
    "completed_at": null,
    "query_text": "Can you compare Crash Plan's unlimited storage feature with competitors?"
  },
  {
    "id": "b6cc43bf-a541-441b-96f5-27c4e912b9c8",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.354+00",
    "completed_at": null,
    "query_text": "What are the key differences between Crash Plan and other data resiliency platforms for large enterprises?"
  },
  {
    "id": "13b676de-0b8f-45f1-bb51-07aafa115358",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.423+00",
    "completed_at": null,
    "query_text": "What are the key differences between Crash Plan and other data resiliency platforms for large enterprises?"
  },
  {
    "id": "bd1ec0a2-09ac-4afc-b34b-767c82f73fac",
    "analysis_run_id": "745c7b05-6bcd-4d3f-9aed-fbf6639d4d6d",
    "status": "processing",
    "attempts": 1,
    "error_message": null,
    "created_at": "2025-05-23 11:32:50.505+00",
    "completed_at": null,
    "query_text": "How does Crash Plan's user-centric control feature stack up against other backup management tools in the industry?"
  }
]