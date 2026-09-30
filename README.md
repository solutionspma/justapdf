# JustaPDF

JustaPDF is the existing Express/static PDF application served by Node.js. It is intentionally not converted to a framework rewrite.

## Production architecture

Browser → nginx → Express/Node.js → PostgreSQL and owner-controlled storage.

PM2 supervises `backend/server.js`. PostgreSQL is reached only from the server through the pool in `backend/database/connection.js`. PDF bytes are stored under `STORAGE_ROOT` with randomized per-user keys; metadata and revisions are stored in PostgreSQL. The native edit service is an optional owner-controlled sidecar at `NATIVE_EDIT_URL`.

## Removed infrastructure

Netlify, Supabase, and Firebase are not runtime dependencies. Browser authentication uses the JustaPDF API and bearer JWTs. No database or privileged service credential is shipped to `public/`.

## Local development

1. Copy `config/env-template` to a private environment file and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies with `npm ci`.
3. Apply the schema with `npm run db:migrate`.
4. Start with `npm start`.
5. Check `GET /api/health`.

For local development without PostgreSQL, the server can start in degraded mode, but database-backed routes and authentication will not work.

## VPS deployment

The expected runtime is Linux + Node.js + PostgreSQL + PM2 + nginx. Review [deploy/nginx/justapdf.com.conf.example](deploy/nginx/justapdf.com.conf.example), install the private environment outside Git, then run:

```sh
npm ci --omit=dev
npm run db:migrate
pm2 startOrReload ecosystem.config.cjs --update-env
curl --fail https://justapdf.com/api/health
```

`scripts/deploy-vps.sh` is the repeatable deployment path for a checked-out VPS copy.

## PDF engine modes

- Native direct: mutate a traced `Tj`, `TJ`, `'`, or `"` source operand while preserving the page content stream.
- Native reconstruction: replace only the traced source text when direct mutation is not safe and a compatible font/resource is available.
- Overlay fallback: compatibility-only behavior and must be reported as overlay, never as native editing.
- OCR: separate processing for image-only pages; preview and download do not consume credits.

The current native service is conservative: if source mapping or font encoding is uncertain, it returns an unsupported capability instead of mutating an unrelated object.

## Validation

Run `npm test`, `npm run lint`, and `npm run build`. Where installed, validate generated PDFs with `qpdf --check`, `pdfinfo`, and `pdftotext`. See `JUSTAPDF_ENGINE_DIRECTIVE.md` for the detailed PDF engineering contract.
