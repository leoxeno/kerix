# Specs

One spec per capability. Numbered, never renamed, never duplicated into `v2` or `final` files.

## Lifecycle

```
Draft → Approved → Implementing → Done → Superseded
```

- **Draft:** edit freely.
- **Approved / Implementing:** update the same spec for refinements; add a revision note for material changes.
- **Done:** do not silently rewrite. A materially new capability gets a new spec.
- **Superseded:** keep for history, point to the replacement at the top.

## When to update vs create

Update the same spec when the change refines how the same requirement is met, clarifies an assumption, threshold, error case or criterion, or the feature is still being implemented. Create a new spec when the change is a new capability or workflow, a new subsystem or independently deliverable feature, or the old spec is Done and the new behaviour is materially different.

## Template

Copy [TEMPLATE.md](TEMPLATE.md). Keep it short enough to read in two minutes and precise enough that nobody has to invent behaviour. Describe intent and constraints; do not specify classes and methods unless the architecture is itself the requirement.

## Index

| # | Spec | Status | Milestone |
|---|---|---|---|
| 001 | [Capture inbox](001-capture-inbox.md) | Draft | 1 |
