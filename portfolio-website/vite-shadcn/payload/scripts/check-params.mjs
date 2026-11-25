// scripts/check-params.mjs
//
// Fails if a route whose path contains a `:param` points at a component that
// never calls useParams().
//
// Why this exists: a detail screen at `transactions/:id` that renders one
// hardcoded record looks completely finished in review. It clicks through from
// the list, it shows a transaction, nobody notices until integration that the
// URL is ignored. That shipped on the first project built from this pack.
//
// v2: reads routes.tsx through the TypeScript AST (scripts/routes-ast.mjs).
// v1 matched route nodes with /\{[^{}]*\}/ and so never saw a route that had
// `meta: { sampleParams: { ... } }` — the shape AGENTS.md recommends. It also
// only understood default imports, and was satisfied by the word "useParams"
// in a comment. All three are fixed: nested nodes are walked, named imports
// resolve, and only a real useParams(...) call counts.

import { existsSync } from "node:fs";
import { parse, readRoutes, ROUTES, ts } from "./routes-ast.mjs";

const data = readRoutes();
if (!data) {
  console.error("Param check requires src/flows/routes.tsx; route tree is missing.");
  process.exit(1);
}

if (data.problems.length) {
  console.error("\n\u2716 param check could not read the route tree:\n   " + data.problems.join("\n   ") + "\n");
  process.exit(1);
}

const callsUseParams = (file) => {
  const sf = parse(file);
  let found = false;
  const visit = (n) => {
    if (found) return;
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === "useParams") {
      found = true;
      return;
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
  return found;
};

const offenders = [];
const unresolved = [];

for (const r of data.routes) {
  if (!/:\w+/.test(r.path) || !r.component) continue;
  if (!r.componentFile || !existsSync(r.componentFile)) {
    unresolved.push(`${ROUTES}:${r.line}  ${r.fullPath} -> ${r.component}`);
    continue;
  }
  if (!callsUseParams(r.componentFile)) offenders.push(r);
}

if (unresolved.length) {
  // Not silently skipped any more: a param route whose screen we cannot find
  // is a route we did not check.
  console.error(
    "\n\u2716 param check could not resolve the screen for:\n   " +
      unresolved.join("\n   ") +
      "\n\n  Import the screen in routes.tsx with a relative or @/ path.\n"
  );
  process.exit(1);
}

if (offenders.length) {
  console.error(
    "\n\u2716 These routes take a :param but their screen never reads it:\n" +
      offenders.map((o) => `   ${o.fullPath}  ->  ${o.component}  (${o.componentFile})`).join("\n") +
      "\n\n  Read it with useParams({ strict: false }) and select from your mock\n" +
      "  list, or the screen renders the same record for every URL.\n"
  );
  process.exit(1);
}

console.log("✓ param routes read their params");
