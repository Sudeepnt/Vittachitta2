# VitthaChittha website: developer handoff

This is the approved design, content and motion for the VitthaChittha website, as plain HTML, CSS and JavaScript. There is no framework and no build step. Open `index.html` in a browser, or serve the folder with any static server.

The content is locked. Please do not edit copy without checking with Utsav.

## What is in this folder

| Path | What it is |
| --- | --- |
| `index.html` | All markup for every page, plus the inline logo sprite and the opening loader |
| `assets/css/site.css` | Design tokens, layout and components |
| `assets/css/motion.css` | Every transition and animation |
| `assets/js/site.js` | Routing, navigation, drawings, forms |
| `assets/js/motion.js` | Loader, rolling headlines, scroll reveals, button hover, smooth scroll |
| `assets/brand/` | The five logo files supplied by the client |
| `single-file/index.html` | The same site with CSS and JS inlined, for quick preview or email |

## Brand

- Colours: cream `#FFFFE4`, dark purple `#1C0B26`, black. Tokens are at the top of `site.css` (`--cream`, `--purple`). Every section is either `.light` or `.dark`, which set `--fg` and `--bg`.
- Display font: **Amiable Song**. The font files were not supplied, so headlines currently fall back to Fraunces from Google Fonts. To switch, add the licensed files and an `@font-face` rule named `"Amiable Song"`. Nothing else needs to change, because `--f-d` already lists it first.
- Text font: DM Sans. Numbers and labels: DM Mono. Devanagari: Noto Serif Devanagari. All three load from Google Fonts in `index.html`.
- Spelling is always **Vittha** and **Chittha**. The legal name, VitthaChittha Services Private Limited, appears only in the footer.

## Pages and routing

The site is one HTML file. Each page is a `<div class="view" data-view="...">` and `site.js` shows one at a time from the URL hash.

| Hash | Page |
| --- | --- |
| `#/` | Home |
| `#/operating` | Platform 01, Operating |
| `#/office` | Platform 02, Founder's Office Finance |
| `#/chittha` | Platform 03, Chittha (includes the operators and the ontology) |
| `#/firm` | The firm, people, commitments |
| `#/letter` | Letter to founders |
| `#/contact` | Book a call |

`#/operators` redirects to `#/chittha`. The closing band and footer are shared by every page except Contact.

**Recommended for production:** move to real URLs (`/operating`, `/chittha` and so on) so each page has its own title, description and search listing. In a framework such as Next.js or Astro, each `.view` block becomes a page and the header, closing band and footer become a shared layout. Class names, CSS and the motion script can be kept as they are.

## Components (class names)

- `.nav`: top bar with dropdowns (`.has`, `.dd`), turns dark over any section marked `data-dark`. `.mmenu` is the phone menu.
- `.hero`: home hero. `#pix` is the falling pixel board.
- `#platforms`: the pinned three-step section. `.acc` is the accordion, `#svcSvg` the isometric stack. Pinning is done in `site.js` (`STEP` is the scroll length per step) and is switched off on phones, where `.svc-m` cards are shown instead.
- `#procSvg` and `.steps`: process diagram and its four cards.
- `.res`, `.res2`: results area with boxes and the envelope.
- `.blog`: article grid. `.win`, `.tree`: the browser window with the tree.
- `.fg`: FAQ groups, built on native `<details>`.
- `.cgrid`, `.bx`, `.vs` (tables), `.rec` (record cards), `.brf` (briefings), `.ppl` (people), `.devb` (the "In development" banner), `.wip` (the small "In development" tag).
- `#cband`: closing band with the typing code window. `footer`.

All isometric drawings are generated in `site.js` as inline SVG (`box`, `deco`, `stack`, `single`, `icon`). There are no image files to export.

## Motion

Everything is in `motion.css` and `motion.js`, and all of it is skipped when the visitor has reduced motion turned on.

1. Opening loader (`#ldr`): three pieces drop into slots, the wordmark rises, then the screen opens into the hero. It runs only on the home page.
2. Rolling headlines (`roll()`): hero, inner page heroes and the closing band.
3. Scroll reveals: classes `rv`, `rvx`, `rvw`, `rvwin` are added by script and switched on by an IntersectionObserver.
4. Platforms section: slabs drop or lift when the step changes (`.iso.dn`, `.iso.up`).
5. Buttons: pixel fill on hover, built on first hover per button (`.fl`), desktop pointers only.
6. Navigation: sliding dropdown panels, rotating arrow, underline draw (`.ul`).
7. FAQ open and close, page change fade, arrow nudge, typing code window.
8. Smooth wheel scrolling: a small script at the end of `motion.js`. If you prefer a library, replace that block with Lenis.

## To do before launch

1. **Forms are not connected.** `#callForm` (Contact), `#waitForm` (Chittha waitlist) and `#letterForm` (letter sign-up) only validate and show a thank-you message. Wire them to your backend or form service in `wire()` in `site.js`.
2. **Remove the review markers.** Anything in a dashed tag (`.tagm`) is a note for review: "Placeholder", "Illustrative", "Demo form", "Proposed", "Confirm", "To be added". Replace the placeholder content, then delete the tags. Also remove the small "show placeholders" toggle (`.mockbar`, `#showMock`).
3. **People.** Names are final. Photos and bios are placeholders.
4. **Links and details to confirm with the client:** the email address and domain (currently `info@vitthachittha.com`), the LinkedIn URL (currently the LinkedIn home page), the CIN in the footer, and the Shivamogga office address, which is intentionally blank.
5. **Chittha is in development.** Keep the "In development" banner and tags. Do not add product screenshots until real ones exist.
6. **Fonts.** Add Amiable Song as described above. Consider self-hosting the Google fonts.
7. **SEO and sharing.** Add a favicon, a social share image, and per-page titles and descriptions once real URLs exist.
8. **Analytics and consent**, if required.

## Tested

Chrome, desktop at 1440 wide and phone at 390 wide: every page, no script errors, no horizontal overflow. Please also test Safari and Firefox before launch.
