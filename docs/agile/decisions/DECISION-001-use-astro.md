# DECISION-001: Use Astro

## Status

Accepted.

## Context

The platform is content-driven, static-first, and only needs selective interactivity.

## Decision

Use Astro as the web foundation, with React islands for interactive controls and Content Collections for structured content.

## Consequences

- Static deployment remains simple.
- Content schema validation happens at build time.
- Future CMS or AI export can be added without replacing the public rendering layer.
