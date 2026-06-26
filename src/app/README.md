# GlobaLeveling JOB v2.1 / CRR Update

This build is based on the previous beta codebase and adds the revised Career measurement system.

## Changes

- Renamed the public JOB metric label/code to `CRR` for Career.
- Kept backward compatibility with existing databases that still store the metric as `JOB`.
- Added JOB/CRR v2 taxonomy and scoring data.
- User selects occupation/profession once in the profile section.
- CRR measurement form shows the selected profession as read-only.
- Removed visible detected industry group UI.
- Removed responsibility scope from CRR input and scoring.
- Company type list is now: Top firm, Top 20, Top 50, Top 100, SME, Local small company.
- Certification/license dropdown now includes `None`.
- Local certification/license still uses percentage complete; the reference link is only a pinned reference link.
- Removed the generated local certificate HTML page from the build.
- Preserved previous beta hotfixes for STR accessories, profile hydration, bootstrap refresh guard, duplicate task generation lock, and Vercel Prisma build script.

## Files to update from previous beta

See the chat response for the exact GitHub file list.
