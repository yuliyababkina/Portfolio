# PageStubScreen

Status: approved 2026-11-25 · 602557119905

<!-- facts:begin (generated from code; never edit by hand) -->
- **View:** PageStubScreen (`src/flows/pages/PageStubScreen.tsx`)
- **Kind:** page
- **Route:** `/:page` (sample `/about`)
- **Flow:** Pages
- **Role:** visitor
- **Opened from:** nothing links here yet (reachable by its address and the DevBar)
- **Exits:** HomeScreen (link to `/`)
- **States:** no stories yet
- **Data:** none
- **Custom components:** none
<!-- facts:end -->

## Purpose
A placeholder destination for the pages the home links to but that are not designed yet: About, CV and Contact. It stops those links from being dead ends. A visitor sees which page they opened and can go back home.

## Behaviour for developers
- The route is `/:page` and reads the page name from the address. `about`, `cv` and `contact` show their own title. Any other name shows "Page".
- "Back to home" goes to `/`.
- Delete this screen as each real page is designed, and give each page its own route.

## Why this shape
- A single shadcn Empty state with one outlined button. It is deliberately plain so nobody mistakes it for finished design.

## Dropped alternatives
- Three separate stub screens. One shared screen is simpler and carries one note.

## Open questions
- "This page is not designed yet." is placeholder copy.
