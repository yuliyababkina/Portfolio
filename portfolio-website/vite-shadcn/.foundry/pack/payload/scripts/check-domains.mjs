// scripts/check-domains.mjs
//
// Enforces AGENTS.md §3 "one flow, one folder" — which until now was prose only.
//
// Why this exists: the cross-flow import ban makes it painful to split a flow,
// so the path of least resistance is to put everything in one folder, where
// nothing crosses a boundary and the linter stays quiet. A real project did
// exactly that: src/flows/home/ held Home, Profile, Notifications, Cards and
// Card details, while routes.tsx labelled them as two different meta.flow
// values. Review caught it; nothing automated did.
//
// The rule, checked from routes.tsx:
//   1. Every screen outside an underscore folder declares meta.flow.
//      (The DevBar and Flow Map group by it; without it the screen lands in
//      "General" and its domain cannot be checked.)
//   2. A folder under src/flows/ holds screens from exactly ONE meta.flow.
//   3. A meta.flow lives in exactly ONE folder.
// Together: folders and flows are the same thing, so the folder tree, the
// DevBar grouping and the Flow Map can never disagree.
//
// Underscore folders (_ready, _mocks, _devbar) are shared ground and exempt.

import { relative, sep } from "node:path";
import { FLOWS, readRoutes } from "./routes-ast.mjs";

const data = readRoutes();
if (!data) {
  console.error("Domain check requires src/flows/routes.tsx; route tree is missing.");
  process.exit(1);
}
if (data.problems.length) {
  console.error("\n\u2716 domain check could not read the route tree:\n   " + data.problems.join("\n   ") + "\n");
  process.exit(1);
}

const errors = [];
const byFolder = new Map(); // folder -> Map(flow -> [component])
const byFlow = new Map(); // flow -> Set(folder)

for (const r of data.routes) {
  if (!r.component) continue; // grouping node, no screen
  if (!r.componentFile) {
    errors.push(`${r.fullPath} -> ${r.component}: screen import could not be resolved.`);
    continue;
  }
  const rel = relative(FLOWS, r.componentFile);
  if (rel.startsWith("..")) {
    errors.push(`${r.fullPath} -> ${r.component}: screen lives outside src/flows (${r.componentFile}).`);
    continue;
  }
  const parts = rel.split(sep);
  if (parts.length < 2) {
    errors.push(`${r.fullPath} -> ${r.component}: screen sits directly in src/flows/. Put it in a flow folder.`);
    continue;
  }
  const folder = parts[0];
  if (folder.startsWith("_")) continue;

  if (!r.flow) {
    errors.push(`${r.fullPath} -> ${r.component}: missing meta.flow (routes.tsx line ${r.line}).`);
    continue;
  }
  if (!byFolder.has(folder)) byFolder.set(folder, new Map());
  const flows = byFolder.get(folder);
  if (!flows.has(r.flow)) flows.set(r.flow, []);
  flows.get(r.flow).push(r.component);

  if (!byFlow.has(r.flow)) byFlow.set(r.flow, new Set());
  byFlow.get(r.flow).add(folder);
}

for (const [folder, flows] of byFolder) {
  if (flows.size > 1) {
    errors.push(
      `src/flows/${folder}/ holds screens from ${flows.size} flows:\n` +
        [...flows].map(([f, cs]) => `       "${f}": ${cs.join(", ")}`).join("\n") +
        `\n     One folder per domain — move each flow's screens to its own folder.`
    );
  }
}
for (const [flow, folders] of byFlow) {
  if (folders.size > 1) {
    errors.push(
      `meta.flow "${flow}" is spread across ${[...folders].map((f) => `src/flows/${f}/`).join(", ")}.\n` +
        `     Give each folder its own meta.flow, or merge the folders.`
    );
  }
}

if (errors.length) {
  console.error(
    "\n\u2716 Flow folders and meta.flow disagree:\n   " +
      errors.join("\n   ") +
      "\n\n  AGENTS.md §3: one folder per domain, one meta.flow per folder.\n"
  );
  process.exit(1);
}

console.log(`✓ flow folders match meta.flow (${byFolder.size} ${byFolder.size === 1 ? "domain" : "domains"})`);
