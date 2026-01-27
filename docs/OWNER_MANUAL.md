# Owner Manual — JustaPDF

> **Platform:** JustaPDF  
> **Category:** Professional Management  
> **Status:** 🔧 In Development

---

## Platform Purpose

JustaPDF is a PDF generation engine that enables document creation, templating, and export across the Pitch ecosystem platforms.

---

## Who This Platform Serves

- **Primary users:** Other Pitch platforms needing PDF generation
- **Business owners:** Platforms requiring document export functionality
- **End users:** Indirect — users of platforms that integrate JustaPDF

---

## What This Platform Does NOT Control

| Concern | Handled By |
|---------|------------|
| Billing | Shared infrastructure / per-export metering |
| Enforcement | Usage-based limits |
| Authentication | Calling platform handles auth |
| Device Runtime | N/A — server-side generation |

---

## Billing & Enforcement Source

**Billing Model:** Per-export (metered usage)

**Billing Authority:** Shared infrastructure

**Enforcement Model:** Usage quotas and rate limiting

**Enforcement Authority:** API-level enforcement

---

## Integration Pattern

JustaPDF is designed to be consumed by other platforms, not used directly by end users. Integration via API calls.

---

*Last updated: January 1, 2026*
