# ADR-001: Use Astro As The Platform Base

## Status

Accepted.

## Decision

Use Astro for the public content platform because the site is content-driven, static-first, and needs limited client-side JavaScript.

## Implementation

- `apps/web` contains the public site.
- Content Collections define the content schema.
- React islands are reserved for interactive controls.
- Docker production deployment serves static output through Nginx.
