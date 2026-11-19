# HANDOFF: scroll-reveal UX task

Branch `nextjs-ux` = the Next.js version of the VitthaChittha site (Next 16, static content in
`content/body.html`, motion in `public/assets/js/motion.js` + `public/assets/css/motion.css`,
routing/drawings in `site.js`, hero puzzle in `puzzle.js`). `main` is the older static build deployed on Vercel; do not touch `main`.

## Hard constraints (from the owner)
- **No change to any text, colours, fonts or layout.** Only motion/UX of how things appear while scrolling.
- Colours stay cream `#FFFFE4` / dark purple `#1C0B26` (NOT blue). The reference site is only for motion/UX.
- Respect `prefers-reduced-motion` (already handled at top of motion.js).
- Must still work on phone width. Don't break the hero puzzle, loader, rolling headlines, nav.

## The task (owner's last prompt, verbatim)
> Now see the ui of the website. How cards appear from the left and all 3 sections at the left appear one after another.
> In our site all 3 appear at a time. And see other sections, how they appear. They make the whole site alive and great UX.
> So do all that UX and alive thing to our site. Go frame by frame.
>
> "Built inside your company, in order." — this section has to feel that things are moving, like a flow. I want that in this section.
> See the video I have given, it shows that great flow. Fix all this. Don't stop until you get all this right.

## Reference material
- `reference/frames/` = 174 frames (3 fps, 58 s) from the owner's screen recording of the reference site (nualt.fr/en).
  Filenames are `fNNNN_SSS.Ss.jpg` (frame index + timestamp). **Study them in order, frame by frame.**
  The original .mov is local-only on the owner's laptop.
- Reference site (read-only inspiration, motion only): https://nualt.fr/en

## What to build
1. Left-column cards/sections must reveal **sequentially** (staggered one after another as scroll progresses), not all at once.
   Currently `rv('.cgrid > div','rv',80,4)` etc. in `motion.js` use a small stagger driven by IntersectionObserver; make the sequencing
   scroll-driven/obvious like the video (cards slide in from the left, each waiting on the previous).
2. Section "Built inside your company, in order." (find it in `content/body.html`; it is the `#steps` / process area, see `procSvg` and `.mv`
   handling in motion.js): make it feel like a **flow**: steps connect and animate in order, lines draw, items hand off to the next as you scroll.
3. Go through every other section and give each a fitting entrance that matches the reference's feel (alive, ordered, smooth easing,
   no jank). Keep durations/easing consistent (existing easing: `cubic-bezier(.16,1,.3,1)`).
4. Test rigorously: `npm install && npm run dev`, check desktop + ~390px phone, scroll slowly and fast, scroll up/down, reload mid-page,
   reduced-motion on. Take screenshots (Playwright is fine) and compare against reference frames. Verify `npm run build` passes.
5. Commit to branch `nextjs-ux` in small commits and push. Do not push to `main`.

## State at handoff (19 Nov 2026)
- Next.js conversion was being pixel-compared against the static build (no-motion comparison); 3 mismatches were fixed. 
- None of the scroll-reveal work above has been started.
