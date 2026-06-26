# GlobaLeveling Job v2.8 - Promotion Polish + Measurement Memory Bootstrap

This build keeps the v2.7 core features and polishes the latest UI/UX feedback.

## Main changes

- Rank promotion animation now renders only the current user's gender form.
- Male/female promotion form uses cropped premium character object assets instead of crude CSS-drawn body parts.
- Promotion header text is centered and no longer repeats `A+ → S-` in the title area.
- Promotion rank cards and chest rank use clean red/gold/mythic aura text, not hand-drawn flame crowns.
- Character Stats fire aura frame is re-aligned to the radar panel border and uses a single visible panel border.
- Overall S display no longer uses the extra fire/orbit effect around the letter.
- Measurement fields now hydrate from previous raw measurements immediately after login/first render because `/api/bootstrap` returns the full bootstrap payload including metric `rawValue`.

## Run locally on Windows PowerShell

```powershell
npm.cmd install
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
```

Open `http://localhost:3000`.
