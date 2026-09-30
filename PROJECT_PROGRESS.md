# JustaPDF migration status

The application is an Express/static production service. The current target is an owner-controlled VPS with nginx, PM2, PostgreSQL, and local/YAHBASE-managed storage.

Completed in this migration:

- PostgreSQL pool and parameterized database access are the only server database authority.
- JWT/password authentication is server-owned; browser code uses `/api/auth`.
- PDF uploads are stored with randomized per-user keys and metadata is stored in PostgreSQL.
- Health, migration, PM2, nginx, and VPS deployment helpers are present.
- Credits are recorded transactionally and are not charged for preview, opening, or download.

Still subject to fixture coverage and production verification:

- PDF native editing must be validated against the supported fixture matrix before being advertised broadly.
- OCR remains a separate operation for scanned/image-only pages.
- Preview/thumbnail generation requires the configured renderer; the API does not fabricate URLs.
