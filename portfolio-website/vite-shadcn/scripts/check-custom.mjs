// scripts/check-custom.mjs
//
// Custom component protocol (AGENTS.md §2a, brief §3.13). Designers build from
// the library; custom UI is the rare, approved, visible exception.
//
// The rule, checked statically per file:
//   A .tsx file in a designer UI folder (src/shared/ui, src/features/*/ui,
//   src/flows) that contains JSX is a CUSTOM component when it references no
//   library component: no value imported from a library package listed in
//   .foundry/library.json (icon packages are deliberately not listed), and none from a project module that itself counts
//   as library (a pack library module, a file that uses the library, or an
//   approved custom component). A custom component must start with:
//
//     /**
//      * @custom <one-line reason: why no library component fits>
//      * @approved <designer who approved it> <YYYY-MM-DD>
//      */
//
//   and needs a story in the "Custom" Storybook group: a src/stories file whose
//   meta title starts with "Custom/" and which imports the component.
//
// Limits (agent review covers the rest): one library reference anywhere in a
// file makes the whole file a library composition, however much raw markup
// surrounds it; components built in .ts files without JSX, or rendered through dynamic values, are not
// seen. Imports that do not resolve to a project file are treated as
// non-library unless their package is listed.

import ts from "typescript";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { samePath } from "./runtime.mjs";
import { gitBlobs } from "./check-scope.mjs";

const UI = [/^src\/shared\/ui\//u, /^src\/features\/[^/]+\/ui\//u, /^src\/flows\//u];
const EXEMPT = [/\.stories\.tsx$/u, /\.test\.tsx$/u, /^src\/flows\/routes\.tsx$/u];
export const CUSTOM_GROUP = "Custom/";

const portable = (cwd, file) => relative(cwd, file).split(sep).join("/");
const parse = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);

/** Parse the header marker; null when absent, { error } when malformed. */
export function readMarker(text) {
  const header = text.slice(0, ts.getLeadingCommentRanges(text, 0)?.at(-1)?.end ?? 0);
  if (!/@custom\b/u.test(header)) return /@custom\b/u.test(text) ? { error: "@custom must be in the file's leading comment" } : null;
  const reason = header.match(/^[\s/*]*@custom[ \t]+(.+?)[ \t]*$/mu)?.[1];
  const approved = header.match(/^[\s/*]*@approved[ \t]+(.+?)[ \t]+(\d{4}-\d{2}-\d{2})[ \t]*$/mu);
  if (!reason || reason.length < 10) return { error: "@custom needs a one-line reason (at least 10 characters)" };
  if (!approved || approved[1].length < 2 || Number.isNaN(Date.parse(approved[2])))
    return { error: "@approved needs the approving designer's name and the date (YYYY-MM-DD)" };
  return { reason, approvedBy: approved[1], date: approved[2] };
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) walk(path, out);
    else if (/\.tsx?$/u.test(entry.name)) out.push(path);
  }
  return out;
}

function resolveLocal(cwd, from, spec) {
  let base;
  if (spec.startsWith("@/")) base = resolve(cwd, "src", spec.slice(2));
  else if (spec.startsWith(".")) base = resolve(dirname(from), spec);
  else return null;
  return ["", ".tsx", ".ts", "/index.tsx", "/index.ts"].map((ext) => base + ext).find((f) => existsSync(f) && statSync(f).isFile()) ?? null;
}

export function customComponents(cwd = process.cwd()) {
  const { custom } = JSON.parse(readFileSync(resolve(cwd, ".foundry/library.json"), "utf8"));
  if (!custom?.packages?.length && !custom?.modules?.length) throw Error("Custom component check requires library sources in .foundry/library.json");
  const isPackage = (spec) => custom.packages.some((p) => spec === p || spec.startsWith(p + "/"));
  const isLibraryModule = (path) => custom.modules.some((m) => (m.endsWith("/") ? path.startsWith(m) : path === m));
  const cache = new Map();
  const info = (file) => {
    if (cache.has(file)) return cache.get(file);
    const text = readFileSync(file, "utf8"), sf = parse(file, text), path = portable(cwd, file);
    const entry = { file, path, marker: readMarker(text), jsx: false, sources: [], referenced: new Set() };
    cache.set(file, entry);
    const bindings = new Map();
    for (const st of sf.statements) {
      if ((ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) && st.moduleSpecifier && ts.isStringLiteral(st.moduleSpecifier)) {
        const spec = st.moduleSpecifier.text;
        if (ts.isExportDeclaration(st)) { if (!st.isTypeOnly) entry.sources.push({ spec, reexport: true }); continue; }
        const clause = st.importClause;
        if (!clause || clause.isTypeOnly) continue;
        const names = [];
        if (clause.name) names.push(clause.name.text);
        if (clause.namedBindings && ts.isNamespaceImport(clause.namedBindings)) names.push(clause.namedBindings.name.text);
        else if (clause.namedBindings) for (const el of clause.namedBindings.elements) if (!el.isTypeOnly) names.push(el.name.text);
        for (const name of names) bindings.set(name, spec);
      }
    }
    const visit = (node) => {
      if (ts.isImportDeclaration(node)) return;
      if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node) || ts.isJsxFragment(node)) entry.jsx = true;
      if (ts.isIdentifier(node) && bindings.has(node.text)) entry.referenced.add(bindings.get(node.text));
      ts.forEachChild(node, visit);
    };
    visit(sf);
    for (const spec of entry.referenced) entry.sources.push({ spec });
    return entry;
  };
  // A module counts as library when the pack lists it, it carries a valid
  // marker, or it references/re-exports a library package or library module.
  const library = (file, seen = new Set()) => {
    const entry = info(file);
    if (isLibraryModule(entry.path) || (entry.marker && !entry.marker.error)) return true;
    if (seen.has(file)) return false;
    seen.add(file);
    return entry.sources.some(({ spec }) => {
      if (isPackage(spec)) return true;
      const local = resolveLocal(cwd, file, spec);
      return local ? library(local, seen) : false;
    });
  };
  const errors = [], found = [];
  for (const file of walk(resolve(cwd, "src"))) {
    const path = portable(cwd, file);
    if (!UI.some((re) => re.test(path)) || EXEMPT.some((re) => re.test(path)) || isLibraryModule(path) || !path.endsWith(".tsx")) continue;
    const entry = info(file);
    if (entry.marker?.error) { errors.push(`${path}: malformed custom marker — ${entry.marker.error}`); continue; }
    if (entry.marker) { found.push({ path, file, ...entry.marker }); continue; }
    if (entry.jsx && !library(file))
      errors.push(`${path}: custom component without an @custom marker. It renders UI but uses no library component. Compose it from the library catalog; if nothing fits, ask the designer (what is needed, why no library component fits, the closest standard alternative) and, once they approve, add the @custom/@approved header.`);
  }
  // Every custom component appears in the Custom Storybook group.
  const stories = walk(resolve(cwd, "src/stories")).filter((f) => f.endsWith(".stories.tsx")).map((file) => {
    const sf = parse(file, readFileSync(file, "utf8"));
    let custom = false;
    const visit = (node) => {
      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "title" && ts.isStringLiteralLike(node.initializer) && node.initializer.text.startsWith(CUSTOM_GROUP)) custom = true;
      ts.forEachChild(node, visit);
    };
    visit(sf);
    const imports = sf.statements.filter(ts.isImportDeclaration).map((st) => resolveLocal(cwd, file, st.moduleSpecifier.text)).filter(Boolean);
    return { file, path: portable(cwd, file), custom, imports };
  });
  for (const component of found) {
    component.stories = stories.filter((s) => s.custom && s.imports.some((i) => i === component.file)).map((s) => s.path);
    if (!component.stories.length) errors.push(`${component.path}: custom component needs a story in the "Custom" Storybook group — a src/stories/custom/*.stories.tsx file with title "${CUSTOM_GROUP}…" that imports it.`);
  }
  return { errors, components: found.map(({ file, ...rest }) => rest) };
}

/** Custom components whose marker is absent from `base` (default: HEAD). */
export function newSince(cwd, components, base) {
  if (!components.length) return [];
  let blobs;
  try { blobs = gitBlobs(cwd, components.map((c) => `${base ?? "HEAD"}:${c.path}`)); }
  catch (error) { if (base) throw error; return components; } // no commit yet: all new
  return components.filter((c, i) => !blobs[i] || !readMarker(blobs[i].toString("utf8")));
}

/** Built Storybook index: each custom story file renders under Custom/. */
export function assertCustomStories(index, components) {
  for (const component of components) for (const story of component.stories) {
    const entries = Object.values(index.entries).filter((e) => e.type === "story" && e.importPath.replace(/^\.\//u, "") === story);
    if (!entries.length || !entries.every((e) => e.title.startsWith(CUSTOM_GROUP)))
      throw Error(`Built Storybook has no "${CUSTOM_GROUP}" story for custom component ${component.path} (${story})`);
  }
}

export function report(cwd = process.cwd(), base) {
  const result = customComponents(cwd);
  const fresh = new Set(newSince(cwd, result.components, base).map((c) => c.path));
  if (result.components.length) {
    console.log(`Custom components (${result.components.length}; + = new since ${base ?? "HEAD"}):`);
    for (const c of result.components) console.log(`  ${fresh.has(c.path) ? "+" : " "} ${c.path} — ${c.reason} (approved by ${c.approvedBy}, ${c.date})`);
  } else console.log("Custom components: none — every UI component composes the library.");
  if (result.errors.length) throw Error("\n✖ custom component check failed:\n   " + result.errors.join("\n   ") + "\n");
  return { ...result, fresh: [...fresh] };
}

if (process.argv[1] && samePath(process.argv[1], fileURLToPath(import.meta.url))) {
  try {
    const at = process.argv.indexOf("--base");
    report(process.cwd(), at > 0 ? process.argv[at + 1] : undefined);
    console.log("Passed custom component check.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
