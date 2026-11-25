# AGENTS.md – Frontend Architecture & Design-in-Code Workflow

> This file is written to be loaded as **agent instructions**. If you are an AI assistant (Claude Code, Cursor, Copilot, v0, etc.) working in this repo, read this whole file before writing a single line. The first thing you do in a session is the **role gate** below — no exceptions.

## 0. Role gate — do this before anything else

Interfaces here are built **in code, skipping the mockup stage**. Two different people touch this repo with two completely different mandates. Before you help anyone "vibe-code" a screen, you must know which one you're talking to.

**First action of every session, ask:**
> **Are you working as the _Designer_ (UI only) or the _Front-end developer_ (integration, logic, state, API)?**

Record the person's role with `git config --local foundry.role designer` or
`git config --local foundry.role developer` after they answer. The default is
`designer`; role storage is local Git config and is never committed.

Then operate in exactly one mode until told otherwise:

- **Designer — Design Mode.** Pure presentation **plus navigable flows**. You compose shadcn/ui components, theme tokens, layout, and states; you create "dumb" presentational components in `src/shared/ui/` or `src/features/*/ui/`; and you assemble them into **navigable user-flows on mock data** in `src/flows/` (route-group folders + a declarative route tree). You navigate with `Link` / `useNavigate` / `useParams`. You do **not** write data fetching (TanStack Query), business logic, global state (Zustand), **routing logic** (loaders, guards, redirects, data-on-route-entry), or models/validators (Zod). If a task seems to require any of that, you stop and explain why instead of doing it.
- **Front-end — Integration Mode.** You own the wiring: real data hooks (`src/features/*/api`), state (`src/features/*/store`), smart components (`src/features/*/controllers`), Zod schemas (`src/features/*/models`), and the **router instance + routing logic** (`src/app`) — you consume the Designer's route tree from `src/flows/` and attach loaders, guards, redirects, and code-splitting. You leave presentation, flows, and theme alone unless a real gap forces a change.

If the person hasn't answered yet, assume **Design Mode** and say so — it's the safe default, because Design Mode can never break logic that isn't there.

**For a dropped, uninitialized pack (first run):** follow `SETUP.md` to scaffold the app and its guardrails, end on the readiness screen. Then ask the designer 2–3 short questions (product, users, any rules) and draft `design/app.design.md` (§2b), and wait for their first screen prompt. Don't build product UI during init.

## 1. Pipeline

1. **UX/UI** builds the interface directly in code: presentational components assembled from shadcn/ui + a shared theme (data via Props), then wired into **navigable user-flows on mock data** (`src/flows/`) so the whole thing is clickable end to end.
2. **Dev** picks up the flows, creates "smart" controllers, wires them to TanStack Query (API) and Zustand (State), converts the flow route tree into the real router (loaders/guards/redirects in `src/app`), and passes real data into the Designer's components — the screens themselves don't change.
3. Stakeholder/client review happens against the **running app**, not static mocks. Design and implementation are the same artifact.

## 2. What "building in code" means with shadcn/ui

**Read this section carefully even if you have used the antd or MUI version of this kit. shadcn is not a component library in the sense those were, and three of the rules are inverted.**

shadcn does not live in `node_modules`. `npx shadcn add button` **copies source into `src/components/ui/`**. You own that code, you can edit it, and it is designer territory. That single fact drives everything below.

- **Compose from `@/components/ui`, don't rebuild it.** `react/forbid-elements` errors on `<button>`, `<input>`, `<select>`, `<textarea>`, `<label>`, the `<table>` family, `<hr>`, `<dialog>`, `<progress>` and `<kbd>` inside hand-written presentation. Reach for the component named in the error message.
- **Raw HTML for text and layout is CORRECT here.** `<h1>`–`<h6>`, `<p>`, `<blockquote>`, `<ul>`/`<ol>`/`<li>`, `<code>`, `<div>`, `<span>`, `<section>`, `<nav>`, `<a>`, `<img>` and `<form>` are all legal and expected. shadcn styles raw HTML through **typeset** (`<div className="typeset">`), so hand-writing a heading *is* the shadcn answer to typography. This is the opposite of the antd rule and it is deliberate — do not "fix" it.
- **Styling is `className` with Tailwind utilities. The `style` prop is a lint error.** There is no `*.styles.ts` file in this kit, unlike every previous one. Anything you would have put in a style object — fixed positioning, z-index, a width — is a utility class.
- **Semantic tokens only.** `bg-primary`, `text-muted-foreground`, `border-input`, `bg-destructive`. Raw palette utilities (`bg-blue-500`, `text-zinc-700`) are a lint error, and so are literal colours and arbitrary colour values (`bg-[#1677ff]`). Arbitrary **sizes** (`w-[340px]`, `max-h-[60vh]`) are fine — the ban is on colour, not on brackets.
- **Theme lives in `src/theme/theme.css`.** It is the one file allowed to contain raw colour values, as oklch custom properties. Change a token there and every screen moves. Note the inversion: the antd/MUI packs banned CSS and put colour in a `.ts` file; here CSS *is* the theme.
- **Editing `src/components/ui/` is allowed — the `cva` variant maps especially.** That is where a button's visual identity lives, and adjusting it is design work, not dev work. Keep to the variant strings and className values; leave the Radix wiring, the `data-slot` attributes and the prop plumbing alone.
- **Adding a component is `npx shadcn add <name>`, never hand-writing one.** If you need a Combobox, install it. If you genuinely need something shadcn has no component for, compose it from what is installed before building anything custom.
- **Look up the API instead of guessing it.** `npx shadcn docs <component> -b radix` prints the real props for the installed base. Since the component source is local and unfamiliar, inventing props is the most common failure mode here — don't.
- **UI text comes from `@/shared/ui/typography`; prose stays raw HTML.** `<Heading>` and `<Text>` exist because shadcn ships no typography component (their docs page is explicitly an example of utility classes, not something `shadcn add` installs). Without them every screen invents its own `text-2xl font-semibold tracking-tight`, which is the type scale drifting outside the design system — the same failure as `bg-blue-500`. Use them for screen titles, section headings and helper text. Keep raw `<h1>`/`<p>`/`<ul>` for prose blocks and rendered markdown, where typeset styles them.
- **Use the components' own state props, presentationally.** `disabled`, `aria-invalid`, `<Skeleton>`, `<Empty>`, `<Spinner>` — drive them from props, never from a real network request during Design Mode.

## 2a. Library first — custom components are approved exceptions

1. **Library first.** Before creating a presentational component, look in the component catalog (Storybook `Components/…`) and compose from shadcn components. Compositions and thin wrappers around shadcn components are ordinary design work.
2. **Ask before custom.** If nothing in the catalog fits, stop before writing it and tell the designer: what is needed, why no shadcn component or composition fits, and the closest standard alternative(s). The designer decides. Never build custom UI silently.
3. **Label approved custom.** After the designer approves, the component file starts with this header — `@custom` and a one-line reason, `@approved` and the approving designer's name and the date:

   ```tsx
   /**
    * @custom Signature pad: no shadcn component captures a drawn signature.
    * @approved Anna Kowalska 2026-11-02
    */
   ```

   Write only an approval the designer actually gave.
4. **Make it visible.** Every custom component has a story in the Custom Storybook group: `src/stories/custom/<Name>.stories.tsx` with `title: "Custom/<Name>"`, importing the component.

**How it is checked** (`scripts/check-custom.mjs`, in pre-commit, init verification and GitLab CI): a `.tsx` file in `src/shared/ui`, `src/features/*/ui` or `src/flows` that renders JSX but uses no shadcn component — neither directly nor through a project component that uses shadcn or is approved custom — fails without the header; an approved custom component without a Custom story fails. Pre-commit and CI print every custom component with its reason, marking new ones with `+`. Icons are not components here: raw markup plus a library icon is still custom. Limits: one library component anywhere in a file makes the whole file a composition, however much raw markup it adds; UI built without JSX is not seen. Agent review covers the rest.

## 2b. Design notes — the designer's reasons, kept next to the screens

Designers never run a command for notes; you keep them. Read `design/app.design.md` and the notes of the flow you work in before you build, and update them while you build.

- **Global note `design/app.design.md`** (the designer's): **Product** (who it is for, what they do), **Rules** (numbered `R1`, `R2`… — the designer's preferences, e.g. "No checkboxes: use switches". Rules are binding: follow them in every screen), **Decisions** (numbered `D1`… — recurring choices lifted from screens, each with the screens that use it).
- **View notes `<View>.design.md`** next to every page, modal, drawer and wizard file in `src/flows/` (not small reusable components; not `_`-prefixed system folders). A modal or drawer written inline in a page belongs to that page's note. A wizard has one note, on the file that renders the stepper. Sections, in this order: **Purpose** (required: why it exists, who uses it, what they get done), **Behaviour for developers** (rules to implement: when actions are enabled or disabled, what happens after each action, errors), **Why this shape** (including why this control and not that one), **Dropped alternatives**, **Open questions**.
- **Facts block.** The top of each view note, between `<!-- facts:begin … -->` and `<!-- facts:end -->`, is generated from code: view, kind, route, flow, role, opened from, exits, steps, states (its stories), data (props), custom components. Never edit it by hand. `npm run notes` refreshes it and creates missing notes from the skeleton; the pre-commit hook refreshes it from the staged code.
- **Status.** `Status: draft`, or `Status: approved <date> · <fingerprint>` once the designer approved it (`Status: approved <date>` for the global note). An approved note is the designer's word. Record approval only with `npm run notes -- approve <View> [app]`, and only after the designer said so.

**Approval protocol — at the end of every task:**
1. Show the designer every new or changed note together (and any note the check lists as "changed since you approved"), and ask for each: **approve, correct, or leave for later?**
2. **Approve** → `npm run notes -- approve <View>`. **Correct** → update the note; if the correction changes the design ("this should be a drawer"), change the screen too, then show it again. **Later** → it stays a draft (drafts never block a commit).
3. When the designer states a preference ("I never want checkboxes"), propose it as a global Rule and add it only after they confirm.
4. When a request conflicts with a Rule, do not silently follow either side: name the Rule (`R2`) and ask — an exception here, or change the Rule?
5. When the same reason appears in several screens' notes, propose lifting it into Decisions, naming the screens.

**First run after setup:** before the first screen, ask the designer 2–3 short questions (what the product is, who uses it, any rules they already have) and draft `design/app.design.md` from the answers; then ask them to approve it.

**How it is checked** (`scripts/design-notes.mjs`, in pre-commit, init verification and GitLab CI): a page, modal, drawer or wizard without a note, a note without a Purpose, a malformed note (title, status, facts block or sections), a note whose screen no longer exists, or a missing global note fails the commit. Drafts and notes changed since approval are listed, never blocking. GitLab CI also fails on facts that do not match the code. The messages speak to the designer ("ask your agent to …"); you do the work.

## 3. Project structure (Domain-Driven Design)

```text
/src
  /app                  # Dev only: router INSTANCE + routing logic (loaders, guards,
                        #   redirects, code-splitting), global providers.
    router.tsx          #   The BRIDGE: consumes flows/routes.tsx generically and builds
                        #   the real route tree from it. Created once, at init, already
                        #   generic — adding a flow must never require editing this.
  /components/ui        # Designer-owned CLI source; generated lint tier.
  /hooks                # CLI-generated hooks only; authored hooks go shared/hooks.
  /lib/utils.ts         # Shared cn() helper; retain the CLI location.
  /flows                # Designer: navigable user-flows on mock data.
                        #   Route-group folders + a declarative route tree. NO logic.
    /home
      HomeScreen.tsx    #   Composes ui/ components, takes data as props with mock defaults, links out.
    /loans
      LoansListScreen.tsx
      /loan-details
        LoanDetailsScreen.tsx   # route: /loans/:id  (reads id via useParams)
    routes.tsx          #   { path, component, children, meta? } tree. Structure + nav
                        #   only — no loaders, no guards, no data fetching.
    /_mocks             # Shared mock data used by multiple flows.
    /_ready             #   ReadyView.tsx — the init status screen. Designer-owned so
                        #   the first real prompt can delete it. Gone after that.
    /_devbar            #   Dev-only nav bar (DevBar.tsx) + flatten.ts. Reads routes.tsx
                        #   to build a jump-to-screen switcher. Never ships to production.
  /shared
    /ui                 # Designer: Reusable "dumb" UI elements, layout primitives
    /hooks              # Designer: shared presentational behaviour (local UI state).
  /features
    /FeatureName
      /ui               # Designer: Feature-specific "dumb" UI elements
      /controllers      # Dev: "Smart" components (orchestrate UI, queries, state)
      /models           # Dev: Zod schemas and derived TS types
      /api              # Dev: TanStack Query hooks (useQuery, useMutation)
      /store            # Dev: Zustand client state
      index.ts          # Public API for the feature
  /theme                # Designer: theme.css semantic tokens (raw colour home),
                        #   ThemeProvider.tsx with useTheme and dark class toggle.
  /stories              # Designer: ThemeShowcase.stories.tsx, FlowMap.stories.tsx
/design
  app.design.md         # Designer: Product, Rules, Decisions (§2b). Each page, modal,
                        #   drawer and wizard also has <View>.design.md next to it.
```

**Styling:** className and Tailwind utilities; no style prop or *.styles.ts.
Use Heading/Text from shared/ui/typography for UI text; prose stays raw HTML.

**Prose tables are the one `<table>` exception.** The element ban targets data tables, which should be `<Table>`. If you are rendering markdown inside a `.typeset` container, raw `<table>` is what typeset styles — put that rendering in a dev-owned component rather than fighting the lint rule in a flow screen.

**Route `meta` (design annotations):** a route may carry
`meta?: { role?, flow?, label?, sampleParams? }` — used to group and label screens
in the DevBar and flow overviews, and to supply a sample `:id` so detail screens
are clickable. Component routes outside underscore folders require `meta.flow`
(P1); the other annotations remain optional. `meta.role` is documentation, not
authorization: `meta.role: 'admin'`
does not restrict anything. Real role guards are Dev's, in `/app`.

**How `/flows` stays logic-free (the seam):** designers declare routes as plain
structure in `flows/routes.tsx` — `{ path, component, children, meta? }` and
nothing else. There is no field for a loader or guard, so there's nowhere to put
logic.
A screen is a **dumb component**: it composes `ui/` parts, takes data as props with mock defaults, navigates with `Link` / `useNavigate`,
and reads params with `useParams`. During integration, Dev builds the real router
in `/app` from that route tree (attaching loaders/guards/redirects) and swaps each
screen's mock defaults for a controller that feeds real props. The screen file
itself doesn't change.

**Route syntax (read this before your first detail screen):** designers write
params as `:id` — readable, and it's what the DevBar and Flow Map render.
`/app/router.tsx` translates to TanStack's `$id` on the way in. Never write `$id`
in `/flows`. Read params with `useParams({ strict: false })`: the tree is built
at runtime from your file, so TanStack can't literal-type the routes, and `strict`
mode would demand a `from` you don't have.

**Nesting:** a node with `children` becomes a layout, and its own `component`
becomes that layout's index route. So `{ path: "loans", component: List,
children: [{ path: ":id", component: Details }] }` gives you `/loans` → List and
`/loans/1001` → Details, which is what you'd expect. You don't need an `<Outlet/>`
in List.


**Base methodology (P1–P10; applies to every library):**

| Rule | Required behaviour and shadcn example | How checked |
|---|---|---|
| P1 | One flow = one top-level folder. Put loan screens in flows/loans with one meta.flow label, e.g. "Loans". That label belongs to only this folder; every non-underscore screen route declares it. | scripts/check-domains.mjs; folder↔label bijection, not identical spelling. Underscore folders exempt. |
| P2 | Flows never import each other's screens. Share an shadcn LoanCard through src/shared/ui; share loans data through src/flows/_mocks. Relative imports within loans, including sibling subfolders, are allowed. | ESLint depth-aware no-restricted-imports at depths 0–6; deeper files reject imports. Source alias rule rejects all @/flows imports inside flows, including own-flow aliases; use relatives. Underscore ground remains exempt for relative imports. |
| P3 | A /loans/:id screen calls useParams({ strict: false }) and selects its mock record by id. | scripts/check-params.mjs requires a call named useParams when that node's own path contains a param; missing routes fail. Inherited params, each value's use and the call's import provenance are outside its analysis. |
| P4 | Screen data arrives as a prop with a mock default: function LoansScreen({ loans = mockLoans }: Props) renders shadcn UI from loans. Never read mockLoans directly in the body. String-label arrays such as ["All", "Recent"] are exempt. | scripts/check-props.mjs: module-level first-object arrays and direct _mocks record exports; defaults, type-only reads and symbol shadowing supported. Empty arrays, factories, re-exports and arbitrary computed data are outside its analysis. |
| P5 | Loading/transition screens show the wait (Skeleton or Spinner) and an exit. Never mount the destination screen under the spinner, even aria-hidden. | Agent-only review; cross-flow lint catches only imports that cross the flow boundary. |
| P6 | Fixed/sticky app chrome uses top-(--devbar-height) in className. The shadcn DevBar publishes 3rem while visible and 0px on hide/unmount; the theme defaults to 0px. | Conformance browser sticky-header scroll/hit test and hide/show/unmount controls; agent review of authored chrome. |
| P7 | Extract on the second use: markup to shared/ui, mock data to flows/_mocks, presentational behaviour (e.g. useDisclosure with local state) to shared/hooks. | Agent-only review of reuse; folders shipped. Lint protects authored hooks but does not detect duplication. |
| P8 | No dynamic import() or React.lazy(() => import(...)) in presentation. Import shadcn UI statically; Dev owns code splitting in app. | ESLint ImportExpression ban. Direct lazy calls without an import expression are not detected by this source rule; agent review completes it. |
| P9 | No eslint-disable comments in authored presentation; fix the violation. | ESLint noInlineConfig ignores and reports the comment; --max-warnings=0 fails. |
| P10 | Every control and screen state leads somewhere: an shadcn Button navigates, opens a modal, changes state or uses a visible stub destination. No dead ends. | Agent-only interaction/state review. |

The source cross-flow glob also matches relative escapes such as
`../../theme/ThemeContext`; use `@/theme/ThemeContext` or `@/shared/ui/LoanCard`
for those imports. Vite and TypeScript resolve `@/` to `src/`.

These scripts preserve the source's static-analysis limits. All three fail
when the mandatory src/flows/routes.tsx is missing, including standalone use.

```tsx
import { Text } from "@/shared/ui/typography";
import { loans as mockLoans } from "../_mocks/loans";
type Props = { loans?: typeof mockLoans };
export default function LoansScreen({ loans = mockLoans }: Props) {
  return <div>{loans.map(loan => <Text key={loan.id}>{loan.id}</Text>)}</div>;
}
```

## 4. The core rule: Smart vs. Dumb

UI components (`shared/ui` or `features/*/ui`) **never** know where their data comes from. They receive data strictly through `Props` and emit actions strictly through `Callbacks`. 

Smart controllers (`features/*/controllers`) fetch data using TanStack Query hooks from `features/*/api` and pass that data down to the UI components.

**Flow screens (`src/flows/*`) are dumb too.** They compose `ui/` components, take data as props with mock defaults, and move between screens with `Link` / `useNavigate` / `useParams`. They contain no fetching, no state stores, no loaders, no guards.

**Who owns the Props contract:** a UI component or flow screen owns **its own Props interface** — that's the presentation contract. Dev's controller adapts models → those props. Designers define the shape they need and never wait on (or import) dev-owned `/models`.

## 5. Who owns what

| Area | Owner | Notes |
|---|---|---|
| `/theme` | UX/UI | Required reviewer on any visual/token change. |
| `/shared/ui`, `/shared/hooks`, `/features/*/ui` | UX/UI | Pure markup, shadcn composition, styles, prop contracts. |
| `/flows` | UX/UI | Navigable screens, route tree (`routes.tsx`), nav links. Mock data only, no routing logic. |
| `/flows/_ready` | UX/UI | Init status screen. Delete it with your first real flow. |
| `/flows/_devbar` | UX/UI | Dev-only nav bar. Dev mounts it once in `/app`; designers own its contents. |
| `/app` (router instance + routing logic) | Dev | Builds the real router from `/flows`, attaches loaders/guards/redirects, global providers. **Written once at init and generic** — if adding a flow makes you want to edit `/app`, that's a bug in the bridge, not a reason to switch modes. |
| `/features/*/controllers` | Dev | Smart logic. Wraps UI components with queries and state. |
| `/features/*/api`, `/store` | Dev | TanStack Query and Zustand implementations. |
| `/features/*/models` | Dev | Zod schemas and validations. |
| `/stories` | UX/UI | Presentation review. |
| `/design`, every `*.design.md` | UX/UI | Design notes (§2b). The agent keeps them; the designer approves them. |

## 6. Design Mode guardrails

When operating in Design Mode (helping a **designer**), you may touch **presentation and flows**: `src/components/ui/`, `src/hooks/` (CLI only), `src/shared/ui/`, `src/shared/hooks/`, `src/features/*/ui/`, `src/flows/`, `src/theme/`, and `src/stories/`. You also keep the design notes (`design/`, `*.design.md`, §2b).

**You MAY** build interactive, navigable prototypes-that-become-the-app:
- Open/close modals, drawers, dropdowns, tabs, steps — local UI state (`useState`).
- **Navigate between screens** with `Link` / `useNavigate`, read route params with `useParams`, and declare the route tree in `src/flows/routes.tsx` (paths incl. `:id`, hierarchy, nav links).
- **Simulate** a submit: show a success message, close the modal, flip to a "submitted" state — with the real work stubbed.
- Feed screens through props with mock defaults. Arrays of string labels are exempt.
- Raw HTML for text/layout (headings, p, lists, div, span, a, img, form) is allowed. Compose installed shadcn controls; use Heading/Text for UI text.

**You MUST NOT — stop and explain instead:**
- Write data fetching of any kind: `fetch`, `axios`, `useQuery`, `useMutation`.
- Add global/business state (`zustand`), or **routing logic**: loaders, guards, `beforeLoad`, `redirect`, or loading data on route entry. Those live in `/app`.
- Wire real behavior into interactions: an `onFinish` that mutates data, a submit that calls a service. Stub these as `console.log` for Dev to wire.
- Modify anything in `api/`, `controllers/`, `store/`, `models/`, or `app/`.
- Hand-roll controls shadcn provides (button, input, select, textarea, label, table family, hr, dialog, progress, kbd). The 16-element map remains exact.
- Hardcode colours, arbitrary colour values, raw palette classes or white/black classes in authored UI. Use semantic tokens; raw colour belongs only in theme/theme.css. Arbitrary sizes remain allowed.
- Use the style prop, *.styles.ts, or a second styling system. Use className with Tailwind; theme.css owns semantic tokens.
- Build a custom component without the designer's approval (§2a), or write an `@approved` line they did not give.
- Mark a design note approved that the designer did not approve, edit a facts block by hand, or follow a request that conflicts with a Rule in `design/app.design.md` without asking (§2b).
- **Change the local role to `developer` to get a commit through.** If the guard blocks you, that IS the answer — report what you hit and stop. Mode changes are a human decision.

## 7. Reviewing the work

`npm run dev` runs the app (`:5173`) and Storybook (`:6006`) together — Storybook isn't optional here, the DevBar links straight into it.

- **Component states:** Storybook.
- **Design notes:** `design/app.design.md` and the `<View>.design.md` next to each screen (§2b). At the end of every task, go through new and changed notes with the designer.
- **Theme check:** The **Theme Showcase** story verifies that a token change in `/src/theme/theme.css` propagated everywhere, at a glance.
- **Flow overview:** The **Flow Map** story (`System/Flow Map`) renders every screen in `flows/routes.tsx`, grouped by flow and filterable by role, with click-through into the running app. The DevBar's "Flow map" button opens it directly — its story ID (`system-flow-map--all-flows`) is load-bearing; renaming the story's `title` or export breaks that button.

## 8. Required AI prompt for Design-Mode layout work

When a designer uses AI to build or change UI, use this as the system prefix **every time**:

> ROLE: Designer, Design Mode. Presentation + navigable flows. You may modify only: /src/components/ui, /src/hooks (CLI only), /src/shared/ui, /src/shared/hooks, /src/features/*/ui, /src/flows, /src/theme, and /src/stories.
> Build EVERYTHING from shadcn/ui. Do NOT hand-roll UI that shadcn provides.
> Style with className/Tailwind and semantic colours only. No style prop, literal/arbitrary colours, palette or white/black utilities in authored UI. Arbitrary sizes and raw prose/layout HTML remain allowed. UI text uses Heading/Text.
> UI components and flow screens must be "dumb" — data via Props (mock defaults are fine), events via Callbacks.
> Apply P1–P10 above: one flow per folder; no cross-flow imports; props with mock defaults; no destination beneath loading UI; chrome offset by --devbar-height; extract on second use; no lazy imports or lint disables; every control/state leads somewhere.
> You MAY build navigation: Link, useNavigate, useParams, and the route tree in /src/flows/routes.tsx (paths incl. :id, hierarchy, nav links). You MAY open modals/drawers and simulate submits (stub the real work as console.log).
> Library first: compose from the shadcn catalog. If nothing fits, stop and ask the designer (what is needed, why nothing fits, the closest standard alternative). Approved custom components carry the @custom/@approved header and a Custom/ story.
> Design notes: read design/app.design.md (its Rules are binding) and the flow's <View>.design.md notes first; keep a note next to every page, modal, drawer and wizard; at the end of the task show new and changed notes and ask the designer to approve, correct or leave them for later. Never edit a facts block by hand.
> Do NOT modify /src/features/*/api, /controllers, /store, /models, or /src/app.
> Do NOT write data fetching (React Query, axios, fetch), global state (Zustand), or routing LOGIC (loaders, guards, redirect, data-on-route-entry). Those belong to Dev.

## 9. Making agents read this first

For the role gate to actually fire, save/symlink this file's content under conventions your tools use:
- **`AGENTS.md`** — emerging cross-tool convention.
- **`CLAUDE.md`** — Claude Code.
- **`.cursorrules`** — Cursor's per-repo rules.
- **`.github/copilot-instructions.md`** — GitHub Copilot.

## 10. Enforcement

Automated checks block the violations they cover. P5, P7 and P10 require agent
review; the table in §3 states each automated check's limits.

**1. ESLint — live, in the editor.**
The rules live in **`eslint.presentation.js`** at the repo root, exported as a flat-config fragment and **appended** to the `eslint.config.js` that init creates. (The current Vite react-ts template ships **oxlint**, not eslint; init removes it so the project has a single linter — the eslint-based toolchain these guardrails run on. See SETUP.md steps 3 and 9.)

```js
// eslint.config.js
import { presentationRules } from "./eslint.presentation.js";

export default defineConfig([
  globalIgnores(["dist", "storybook-static"]),
  // ...the react-ts baseline init sets up — typescript-eslint, react-hooks,
  //    react-refresh. These MUST survive.
  ...presentationRules,   // last, so its bans win any conflict
]);
```

> **Append, never replace.** Dropping `presentationRules` in as the whole config
> deletes `react-hooks` and `typescript-eslint`, which means `--max-warnings=0`
> in CI passes over a config with no real rules — a green check that proves
> nothing. Verify with
> `npx eslint --print-config src/flows/routes.tsx`: it must list
> `react-hooks/rules-of-hooks` **and** `react/forbid-elements`.

The two lint tiers preserve the original shadcn policy:

| Coverage | Generated components/ui and hooks | Authored flows, shared/ui, shared/hooks, features/*/ui, theme, stories |
|---|---|---|
| Exact shadcn logic import/global bans, arbitrary colours, raw palette | yes | yes |
| 16 raw controls, style prop, literal colours, white/black | no | yes |
| Dynamic import and lint suppressions prohibited | no | yes |
| React Compiler quality and refresh rules | off | on, except original theme exemption |
| rules-of-hooks / exhaustive-deps | on | on |

P15 extends authored coverage to theme and pre-commit/lint-staged to theme and
shared/hooks. Keep all fifteen original compiler exemptions for generated code
and theme; classic hook correctness stays active. Complete import payloads are
composed with Base flow boundaries at every depth. No shadcn bans are merged.

Needs `eslint-plugin-react` in devDependencies.

**2. Scope check — per-person role (scripts/check-scope.mjs)**
The default role is designer. Store it with `git config --local foundry.role designer`;
a developer sets `git config --local foundry.role developer` on their own machine.
Never commit a role file and never change role just to bypass a blocked commit.

The unchanged dev-area patterns protect app, smart feature folders and tests.
A file identical to the shipped SHA-256 fingerprint may be committed by either
role; editing a shipped dev-area file requires the developer role. Init makes
the setup commit using your own Git identity, including in repositories that
already contain a README commit. The local check reads the index, not unstaged files.

**3. Methodology scripts**
Run `node scripts/check-domains.mjs`, `node scripts/check-params.mjs` and
`node scripts/check-props.mjs`. Init verification and generated CI run all three.

**4. Custom component check**
`node scripts/check-custom.mjs` enforces §2a and lists custom components;
pre-commit marks those new since HEAD and CI those new since the merge base.
Init verification and CI also require each one's Custom story in the built Storybook.

**5. Design notes check**
`scripts/design-notes.mjs` enforces §2b. Pre-commit refreshes the facts from the staged code and stages the updated notes, then fails on a missing, Purpose-less, malformed or orphan note and lists drafts and notes changed since approval. Init verification and GitLab CI run the same check; CI also fails on stale facts. Design notes are designer territory in the scope check.

**6. Pre-commit & CI**
Husky refreshes design-note facts, then runs the scope guard, the methodology, custom component and design notes checks, then lint-staged, through Node. Generated projects use
GitLab: .gitlab-ci.yml only invokes `node scripts/ci.mjs`. CI uses the merge base,
forces designer scope independent of local Git role, and reads its fingerprint
and guard expectations from the base commit; policy edits in the diff cannot
approve themselves. Full history and a resolvable GitLab diff base are required.
CI runs rule-payload integrity, violating and allowed probes, types, lint, builds,
DevBar absence, story ids, generic router and scope checks; unavailable checks fail.
The local role is an early warning, not an authorization lock. Required external
GitLab pipeline protection/approval is separate deployment configuration.
