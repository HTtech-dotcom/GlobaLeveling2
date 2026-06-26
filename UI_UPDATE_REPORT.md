# UI Update Report - v2.8

## 1. Rank promotion

Files changed:

- `src/components/tasks/completion-toast.tsx`
- `src/app/globals.css`
- `public/effects/promotion-*.png`

Changes:

- Current-gender only: male users see only male form, female users see only female form.
- Removed the repeated rank transition text from the promotion header.
- Header text is centered.
- Added `live-avatar-asset` to use premium cropped character assets.
- Hid old CSS-drawn body pieces in live promotion.
- Kept object-based animation layers: old rank card, forge core, new rank card, runes, particles, platform, avatar asset, chest rank.
- Removed hand-drawn flame crowns from `S`/rank text.
- `B → A`, `A → S`, and `S → SS` still map to gold/fire/mythic promotion themes.

## 2. Character Stats aura

File changed:

- `src/app/globals.css`

Changes:

- Fire frame is aligned to the radar panel border.
- Extra inner border of the flame overlay is removed.
- The frame reads as one radar border.
- Overall S uses clean red aura text only; extra orbit/fire pseudo-elements are disabled.

## 3. Measurement memory

File changed:

- `src/app/api/bootstrap/route.ts`

Changes:

- Bootstrap API now uses `buildBootstrapState(user.id)`.
- The initial app load now includes metric `rawValue` in `data.metrics`.
- Measurement forms can show previous raw inputs immediately after login/first render, without needing the user to edit and save once.
