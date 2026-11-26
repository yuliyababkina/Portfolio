// scripts/check-props.mjs
//
// Fails if a flow screen reads mock RECORDS directly instead of taking them as
// a prop with a mock default.
//
// Why this exists: AGENTS.md §4 promises that at integration, Dev wraps a
// screen in a controller and "the screen file itself doesn't change". That
// only holds if the screen takes its data as a prop with a mock default:
//
//   const cards = [{ id: 1 }, { id: 2 }];
//   export default function CardsScreen() { return cards.map(...) }      // ✗
//
//   import { cards as mockCards } from "../_mocks/cards";
//   export default function CardsScreen({ cards = mockCards }: Props) {  // ✓
//
// v2 closes the hole v1 left open. v1 only looked at arrays declared in the
// screen's own file, so a screen that imported records from _mocks/ and
// mapped over them directly passed — the SAME broken seam, one file away. It
// also only understood `export default function`. v2 uses the TypeScript AST
// with real symbol resolution, so:
//   - module-level arrays of objects AND arrays imported from any _mocks/ file
//     are both candidates;
//   - `export default function`, `export default X` and arrow components all
//     have their props found;
//   - a candidate may appear ONLY as a prop default (or in a type position,
//     like `typeof mockCards`). Any other read is the screen bypassing its own
//     prop, and fails;
//   - an inner variable that happens to share the name is not confused with
//     the mock, because identity is by symbol, not by spelling.
//
// Arrays of plain strings (`["all", "recent"]`) are labels, not data, and are
// never flagged. Helpers exported from _mocks (a formatter, a factory) are not
// arrays, so they are not flagged either.

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { FLOWS, ROUTES, parse, unwrap, valueImports, inTypePosition, lineOf, ts } from "./routes-ast.mjs";

if (!existsSync(ROUTES)) {
  console.error("Props check requires src/flows/routes.tsx; route tree is missing.");
  process.exit(1);
}

/** Every .tsx under src/flows, minus infrastructure and the route tree. */
function screens(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) return entry === "_devbar" || entry === "_mocks" ? [] : screens(full);
    return full.endsWith(".tsx") && resolve(full) !== resolve(ROUTES) ? [full] : [];
  });
}

/** An array literal whose first element is an object literal. */
const isRecordArray = (init) => {
  const a = unwrap(init);
  if (!a || !ts.isArrayLiteralExpression(a)) return false;
  const first = unwrap(a.elements[0]);
  return !!first && ts.isObjectLiteralExpression(first);
};

/** Does `file` export `name` (or default) as an array of records? */
const mockExportCache = new Map();
function exportsRecords(file, name) {
  const key = `${file}::${name}`;
  if (mockExportCache.has(key)) return mockExportCache.get(key);
  let result = false;
  if (file && existsSync(file)) {
    const sf = parse(file);
    const locals = new Map();
    for (const st of sf.statements) {
      if (ts.isVariableStatement(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name)) locals.set(d.name.text, d.initializer);
        }
      }
    }
    const isExported = (st) => st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    for (const st of sf.statements) {
      if (name === "default" && ts.isExportAssignment(st)) {
        const e = unwrap(st.expression);
        result ||= isRecordArray(e) || (ts.isIdentifier(e) && isRecordArray(locals.get(e.text)));
      }
      if (ts.isVariableStatement(st) && isExported(st)) {
        for (const d of st.declarationList.declarations) {
          if (ts.isIdentifier(d.name) && d.name.text === name) result ||= isRecordArray(d.initializer);
        }
      }
      if (ts.isExportDeclaration(st) && !st.moduleSpecifier && st.exportClause && ts.isNamedExports(st.exportClause)) {
        for (const el of st.exportClause.elements) {
          if (el.name.text === name) result ||= isRecordArray(locals.get((el.propertyName ?? el.name).text));
        }
      }
    }
  }
  mockExportCache.set(key, result);
  return result;
}

/** The first parameter of the file's default-exported component, if any. */
function componentParam(sf) {
  const fnByName = new Map();
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) fnByName.set(st.name.text, st);
    if (ts.isVariableStatement(st)) {
      for (const d of st.declarationList.declarations) {
        const init = unwrap(d.initializer);
        if (ts.isIdentifier(d.name) && init && (ts.isArrowFunction(init) || ts.isFunctionExpression(init))) {
          fnByName.set(d.name.text, init);
        }
      }
    }
  }
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) {
      return st.parameters[0];
    }
    if (ts.isExportAssignment(st)) {
      const e = unwrap(st.expression);
      if (ts.isArrowFunction(e) || ts.isFunctionExpression(e)) return e.parameters[0];
      if (ts.isIdentifier(e)) return fnByName.get(e.text)?.parameters[0];
      // memo(X) / forwardRef(X): look one level in.
      if (ts.isCallExpression(e) && e.arguments[0]) {
        const a = unwrap(e.arguments[0]);
        if (ts.isArrowFunction(a) || ts.isFunctionExpression(a)) return a.parameters[0];
        if (ts.isIdentifier(a)) return fnByName.get(a.text)?.parameters[0];
      }
    }
  }
  return undefined;
}

const files = screens(FLOWS);
// One program for all screens, for symbol resolution only. noResolve/noLib keep
// it fast — we need scopes, not types.
const program = ts.createProgram(files, {
  noResolve: true,
  noLib: true,
  jsx: ts.JsxEmit.Preserve,
  allowJs: false,
  skipLibCheck: true,
});
const checker = program.getTypeChecker();

const offenders = [];

for (const file of files) {
  const sf = program.getSourceFile(file);
  if (!sf) continue;

  // name -> { decl: Identifier, why }
  const candidates = [];

  for (const st of sf.statements) {
    if (!ts.isVariableStatement(st)) continue;
    for (const d of st.declarationList.declarations) {
      if (ts.isIdentifier(d.name) && isRecordArray(d.initializer)) {
        candidates.push({ decl: d.name, why: "declared in this file" });
      }
    }
  }
  for (const [, imp] of valueImports(sf, file)) {
    if (!/(^|\/)_mocks(\/|$)/.test(imp.spec)) continue;
    if (imp.exported === "*" || exportsRecords(imp.file, imp.exported)) {
      candidates.push({ decl: imp.node, why: `imported from ${imp.spec}` });
    }
  }
  if (!candidates.length) continue;

  const param = componentParam(sf);
  const bySymbol = new Map();
  for (const c of candidates) {
    const sym = checker.getSymbolAtLocation(c.decl);
    if (sym) bySymbol.set(sym, { ...c, name: c.decl.text, reads: [], asDefault: false });
  }

  const visit = (n) => {
    if (ts.isIdentifier(n)) {
      const sym = checker.getSymbolAtLocation(n);
      const c = sym && bySymbol.get(sym);
      const p = n.parent;
      const isDeclSite =
        (p && (ts.isVariableDeclaration(p) || ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p)) && p.name === n);
      if (c && !isDeclSite && !inTypePosition(n)) {
        const isPropDefault =
          param && ts.isBindingElement(p) && p.initializer === n && p.parent?.parent === param;
        const isParamDefault = param && p === param && param.initializer === n;
        if (isPropDefault || isParamDefault) c.asDefault = true;
        else if (!(ts.isPropertyAccessExpression(p) && p.name === n) && !(ts.isJsxAttribute(p) && p.name === n)) {
          c.reads.push(lineOf(sf, n));
        }
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);

  for (const c of bySymbol.values()) {
    if (c.reads.length) offenders.push({ file, ...c });
  }
}

if (offenders.length) {
  console.error(
    "\n\u2716 These screens read mock records directly instead of taking them as props:\n" +
      offenders
        .map((o) => `   ${o.file}:${o.reads.join(",")}  ${o.name} (${o.why})${o.asDefault ? " — also a prop default, but read directly too" : ""}`)
        .join("\n") +
      "\n\n  Accept the data as a prop with the mock as its default, and read only the prop:\n\n" +
      "     import { cards as mockCards } from \"../_mocks/cards\";\n" +
      "     type Props = { cards?: Card[] };\n" +
      "     export default function Screen({ cards = mockCards }: Props) { ... cards.map(...) }\n\n" +
      "  A list of plain strings is labels, not data, and is never flagged.\n"
  );
  process.exit(1);
}

console.log("✓ flow screens take their data as props");
