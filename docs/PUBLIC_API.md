# JustaPDF Public API (v1)

Base URL:

```
https://api.justapdf.com/v1
```

## Authentication

### API Keys

Header:

```
Authorization: Bearer jp_live_xxxxxxxxx
```

Scopes:

- `pdf:read`
- `pdf:write`
- `batch:run`
- `legal:unredact`
- `audit:read`

## Credits

### Check Balance

```
GET /credits
```

Response:

```json
{
  "balance": 1240,
  "plan": "pro",
  "addons": ["batch4", "unredact_legal"]
}
```

## File Upload

### Upload PDF

```
POST /files
Content-Type: multipart/form-data
```

Response:

```json
{
  "file_id": "pdf_9f82",
  "pages": 42,
  "hash": "sha256:..."
}
```

## Single Tool Execution

### Run Tool

```
POST /tools/{tool_id}
```

Body:

```json
{
  "file_id": "pdf_9f82",
  "options": {}
}
```

Response (async):

```json
{
  "job_id": "job_abc123",
  "status": "queued",
  "credits_used": 3
}
```

## Job Status & Result

### Check Job

```
GET /jobs/{job_id}
```

Response:

```json
{
  "status": "complete",
  "output_file_id": "pdf_out_77a",
  "download_url": "https://cdn.justapdf.com/..."
}
```

## Batch Execution (Batch 4)

### Create Batch Job

```
POST /batch
```

Body:

```json
{
  "files": ["pdf_1", "pdf_2", "pdf_3"],
  "tool": "normalize_strict",
  "parallel": true,
  "resume": true
}
```

Response:

```json
{
  "batch_id": "batch_998",
  "jobs_created": 3,
  "credits_reserved": 12
}
```

## Batch Templates

### Save Template

```
POST /batch/templates
```

Body:

```json
{
  "name": "Court Prep",
  "steps": [
    { "tool": "redact_full" },
    { "tool": "flatten" },
    { "tool": "linearize" }
  ]
}
```

### Run Template

```
POST /batch/templates/{id}/run
```

## Legal Un-Redact

### Execute Legal Un-Redact

```
POST /tools/unredact_legal
```

Body:

```json
{
  "file_id": "pdf_legal1",
  "attestation": true,
  "reason": "Court order 23-CV-1092"
}
```

Response:

```json
{
  "job_id": "job_legal77",
  "credits_used": 25,
  "audit_id": "audit_44f"
}
```

## Audit Log API

### Query Audit Logs

```
GET /audit
```

Response:

```json
{
  "entries": [
    {
      "tool": "unredact_legal",
      "file_hash": "...",
      "timestamp": 1712000000,
      "reason": "Court order"
    }
  ]
}
```

## Rate Limits

| Tier     | Requests / min |
| -------- | -------------- |
| Free     | 30             |
| Pro      | 120            |
| Business | 600            |
| Batch 4  | 2,000          |

Batch jobs count as 1 request, not N.

## Error Model

```json
{
  "error": {
    "code": "INSUFFICIENT_CREDITS",
    "message": "Not enough credits for this operation"
  }
}
```

Legal-specific:

- `LEGAL_ATTESTATION_REQUIRED`
- `ADDON_REQUIRED`
- `UNAUTHORIZED_SCOPE`

## Webhooks

### Register Webhook

```
POST /webhooks
```

Events:

- `job.complete`
- `job.failed`
- `batch.complete`
- `legal.unredact.used`

Payload includes: `job_id`, `file_id`, `credits_used`, `timestamp`.
