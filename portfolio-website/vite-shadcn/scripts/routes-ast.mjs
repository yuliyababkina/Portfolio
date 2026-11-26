// scripts/routes-ast.mjs
//
// Shared reader for the guard scripts (check-params, check-domains,
// check-props). Parses source with the TypeScript compiler API instead of
// regexes.
//
// Why not regexes any more: the first check-params matched route nodes with
// /\{[^{}]*\}/, which only sees objects with NO nested braces. A route that
// carries `meta: { sampleParams: { id: "1001" } }` — the exact shape AGENTS.md
// recommends — was invisible to it, so the check passed while the screen
// ignored its :id. An AST has no such blind spot.
//
// `typescript` is already a devDependency of the Vite react-ts template, so
// this adds nothing to install.

import ts from "typescript";
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";

export const ROUTES = "src/flows/routes.tsx";
export const FLOWS = "src/flows";

export function parse(file) {
  return ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

/** Strip `as const`, `satisfies X`, parentheses. */
export function unwrap(node) {
  while (
    node &&
    (ts.isAsExpression(node) ||
      ts.isSatisfiesExpression(node) ||
      ts.isParenthesizedExpression(node) ||
      ts.isTypeAssertionExpression(node))
  ) {
    node = node.expression;
  }
  return node;
}

export const lineOf = (sf, node) => sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1;

const propName = (p) =>
  p.name && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name)) ? p.name.text : undefined;

const prop = (obj, name) => {
  const p = obj.properties.find((x) => ts.isPropertyAssignment(x) && propName(x) === name);
  return p ? unwrap(p.initializer) : undefined;
};

/** Resolve a relative or `@/` import to a file on disk, or null. */
export function resolveModule(fromFile, spec) {
  let base;
  if (spec.startsWith("@/")) base = resolve("src", spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(fromFile), spec);
  else return null;
  return (
    ["", ".tsx", ".ts", "/index.tsx", "/index.ts"]
      .map((ext) => base + ext)
      .find((f) => existsSync(f) && statSync(f).isFile()) ?? null
  );
}

/** Value imports of a file: local name -> { spec, exported, file }. */
export function valueImports(sf, fromFile) {
  const out = new Map();
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause || st.importClause.isTypeOnly) continue;
    const spec = st.moduleSpecifier.text;
    const file = resolveModule(fromFile, spec);
    const clause = st.importClause;
    if (clause.name) out.set(clause.name.text, { spec, exported: "default", file, node: clause.name });
    const nb = clause.namedBindings;
    if (nb && ts.isNamespaceImport(nb)) out.set(nb.name.text, { spec, exported: "*", file, node: nb.name });
    if (nb && ts.isNamedImports(nb)) {
      for (const el of nb.elements) {
        if (el.isTypeOnly) continue;
        out.set(el.name.text, {
          spec,
          exported: (el.propertyName ?? el.name).text,
          file,
          node: el.name,
        });
      }
    }
  }
  return out;
}

/**
 * Read the designer's route tree statically.
 *
 * Returns { routes, problems }. `routes` is a flat list of every node:
 *   { path, fullPath, component, componentFile, flow, sampleParams, line }
 *
 * FAILS CLOSED: anything the reader cannot understand (a spread, a variable,
 * a computed path) goes into `problems`, and callers exit 1 on it. routes.tsx
 * is meant to be plain structure — if a guard cannot read it, the guard is not
 * passing, it is blind.
 */
export function readRoutes() {
  if (!existsSync(ROUTES)) return null;
  const sf = parse(ROUTES);
  const imports = valueImports(sf, ROUTES);
  const problems = [];
  const routes = [];

  let arr;
  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && d.name.text === "routes") arr = unwrap(d.initializer);
    }
  }
  if (!arr || !ts.isArrayLiteralExpression(arr)) {
    problems.push(`${ROUTES}: could not find \`export const routes = [ ... ]\` as an array literal.`);
    return { routes, problems };
  }

  const walk = (elements, parent) => {
    for (const raw of elements) {
      const el = unwrap(raw);
      if (!ts.isObjectLiteralExpression(el)) {
        problems.push(
          `${ROUTES}:${lineOf(sf, raw)}: route entry is not a plain { ... } object ` +
            `(spread or variable?). Write routes inline so the guards can read them.`
        );
        continue;
      }
      const line = lineOf(sf, el);
      const pathNode = prop(el, "path");
      if (!pathNode || !ts.isStringLiteralLike(pathNode)) {
        problems.push(`${ROUTES}:${line}: \`path\` must be a string literal.`);
        continue;
      }
      const path = pathNode.text;
      const fullPath = `${parent}/${path}`.replace(/\/+/g, "/");

      const compNode = prop(el, "component");
      let component = null;
      if (compNode) {
        if (ts.isIdentifier(compNode)) component = compNode.text;
        else problems.push(`${ROUTES}:${line}: \`component\` must be an imported identifier.`);
      }

      const meta = prop(el, "meta");
      let flow = null;
      let sampleParams = null;
      if (meta && ts.isObjectLiteralExpression(meta)) {
        const f = prop(meta, "flow");
        if (f && ts.isStringLiteralLike(f)) flow = f.text;
        const sp = prop(meta, "sampleParams");
        if (sp && ts.isObjectLiteralExpression(sp)) {
          sampleParams = Object.fromEntries(
            sp.properties
              .filter(ts.isPropertyAssignment)
              .map((p) => [propName(p), unwrap(p.initializer)])
              .filter(([, v]) => v && ts.isStringLiteralLike(v))
              .map(([k, v]) => [k, v.text])
          );
        }
      }

      routes.push({
        path,
        fullPath,
        component,
        componentFile: component ? imports.get(component)?.file ?? null : null,
        flow,
        sampleParams,
        line,
      });

      const kids = prop(el, "children");
      if (kids) {
        if (ts.isArrayLiteralExpression(kids)) walk(kids.elements, fullPath);
        else problems.push(`${ROUTES}:${line}: \`children\` must be an array literal.`);
      }
    }
  };

  walk(arr.elements, "");
  return { routes, problems };
}

/** True if `node` sits anywhere inside a type position (typeof X, X[], etc). */
export function inTypePosition(node) {
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isTypeNode(n)) return true;
    if (ts.isStatement(n) || ts.isBlock(n) || ts.isSourceFile(n)) return false;
  }
  return false;
}

export { ts };
