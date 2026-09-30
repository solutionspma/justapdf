# Migration worklog

## 2026-09-30

- Recorded baseline: the existing Express server served `/api/health` on loopback but had no usable database configuration and attempted a failed remote admin bootstrap.
- Created rollback references `backup-pre-yahbase-migration-20260930` and `justapdf-pre-yahbase-migration-20260930` at the pre-migration commit.
- Replaced the dual-provider database adapter with PostgreSQL pooling, parameterized CRUD, transactional helpers, and owner-controlled filesystem storage.
- Added the real schema, migration/check scripts, production environment validation, PM2 configuration, nginx example, and VPS deployment helper.
- Replaced client-side provider authentication with server API JWT authentication and persisted user registration/login.
- Replaced document mocks for upload, metadata, ownership, soft delete, and download paths.
- Removed obsolete hosting/provider configuration and client SDK entry points.
- Native PDF editing remains under validation. Direct operand editing is the supported default; white-box PDFium editing is not a native mode.
