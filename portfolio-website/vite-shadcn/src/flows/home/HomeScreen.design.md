# HomeScreen

Status: approved 2026-11-25 · e9fd03f82079

<!-- facts:begin (generated from code; never edit by hand) -->
- **View:** HomeScreen (`src/flows/home/HomeScreen.tsx`)
- **Kind:** page, with an inline drawer (shadcn Sheet)
- **Route:** `/`
- **Flow:** Home
- **Role:** visitor
- **Opened from:** PageStubScreen (link)
- **Exits:** a computed address (link)
- **States:** no stories yet
- **Data:** `navItems?: NavItem[]`; `profile?: Profile`
- **Custom components:** none
<!-- facts:end -->

## Purpose
The first screen a hiring manager, design leader, recruiter or peer sees. In a few seconds it should say who Yuliya is (Senior Product Designer), what she does (untangling UX debt in complex products), how credible that is (7+ years, a Swiss B2B platform, a 0→1 product and its design system), and where to go next (view the work or get in touch). It must read as confident and calm, about ownership and outcomes rather than craft alone.

## Behaviour for developers
- Nav: "Work" scrolls to the case-study card on this page (`#work`). "About", "CV ↗" and "Contact" are routes (`/about`, `/cv`, `/contact`) that currently open a stub screen. "CV ↗" is meant to open the CV, so decide whether it is a file or a page.
- "Yuliya Babkina" (wordmark) goes to `/`.
- "View my work" scrolls to `#work`. "Get in touch" goes to `/contact`. Replace the stub with the real contact destination.
- Below `lg` the nav links collapse into a "Menu" button that opens a right-hand sheet with the same four links. Choosing a link closes the sheet.
- All text, links and the next-work label come in through the `profile` and `navItems` props, so they can come from a CMS later.
- The next-work card is the top of the first case study. Today it only shows a label ("Selected work") and an index ("01"). Replace it with the real first case study.

## Why this shape
- One accent colour, highlighter yellow, used in only two places: the mark behind "UX debt" and the primary button. Everything else is black, white and grey (rule R2).
- The headline is two lines at 1728px wide and set at 64px in Geist SemiBold with tight tracking. It scales down with the viewport until `lg`, then wraps naturally.
- The portrait is about 48% of the screen width, black and white, and bleeds off the bottom of the first viewport. It is smaller than before so the top of the first case-study card can peek in under it and signal that work follows.
- One left edge (96px on large screens, 24px on small) is shared by the nav, text and buttons. Spacing follows an 8px scale: eyebrow to headline 16, headline to summary 32, summary to buttons 40.
- Primary is a filled yellow pill, secondary is an outlined pill. Both are 48px high.
- On small screens the portrait comes first, cropped to head and shoulders, then the text, then full-width stacked buttons.

## Dropped alternatives
- A highlighter built into the Heading component: the mark is inline in this screen because it is used once. Move it to `shared/ui` when a second screen needs it.
- A text-only secondary button with an arrow: the outlined pill keeps the copy exactly as written.

## Open questions
- The portrait image (`public/images/portrait.jpg`, 0.9 MB) was exported from Figma with the page grey (#F3F4F4) baked in as its background, so it blends into the page. In dark mode that grey rectangle would show. A transparent cut-out would fix that, and should be compressed further before launch.
- "Menu" on small screens is new copy that is not in the original content.
- The first-case-study card is a placeholder with no real content yet.
- The page title in `index.html` is still "scaffold". It sits outside the designer's folders, so a developer should change it.
