# Admin Design Reservation

## V1 Boundary

`/admin` is a static noindex shell. It does not provide:

- authentication
- content writes
- workflow state
- CMS adapter
- database connection

## Future Information Architecture

- Dashboard
- Content calendar
- Collection editor
- Review queue
- Media library
- Search index status
- Publishing checklist
- Settings

## Future Decision

Round 2 must decide between:

- independent `apps/admin`
- external CMS
- Git-based CMS

The decision must include auth, draft/review/publish workflow, rollback, content schema compatibility, and deployment implications.
