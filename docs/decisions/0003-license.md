# ADR-0003 · All rights reserved

**Status:** Accepted · 2026-10-06

## Decision

The repository is public so the build can be followed, but no rights are granted. `LICENSE` states all rights reserved; `package.json` says `UNLICENSED`.

## Why

The owner chose the most restrictive option. Kerix may become a product. As sole author the owner can relicense to something more open at any time, but can never withdraw rights already granted on a released version. Starting closed is the reversible choice.

## Alternatives considered

PolyForm Strict (noncommercial, no changes, no redistribution), PolyForm Noncommercial, AGPL-3.0, MIT.

## Consequences

- Contributions from others are not expected; if one arrives, a contributor agreement is needed before merging.
- No dependency may be vendored into the source tree if its licence requires downstream rights (copyleft). npm dependencies used as libraries are fine.
- Permission requests go through GitHub issues.
