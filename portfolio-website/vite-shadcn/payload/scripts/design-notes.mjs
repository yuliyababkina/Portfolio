// scripts/design-notes.mjs
//
// Design notes (AGENTS.md §2b, brief §3.9). Designers never run this; the
// pre-commit hook, verification and GitLab CI do, and agents use
// `npm run notes`.
//
//   design/app.design.md        the designer's global note: Product, Rules, Decisions
//   <View>.design.md            next to every page, modal, drawer and wizard in src/flows
//
// A view note starts with a FACTS block generated here from code (never edited
// by hand), then the designer's reasons. What counts as a view:
//   page    a component bound in src/flows/routes.tsx
//   wizard  a file that renders the library's stepper (one note per wizard)
//   modal   a file that renders the library's modal component
//   drawer  a file that renders the library's drawer component
// The library's components come from .foundry/library.json (`views`, socket
// slot L8). `_`-prefixed folders (_ready, _devbar, _mocks…) are system flows
// and have no notes. A modal written inline in a page belongs to the page.
//
// Modes (node scripts/design-notes.mjs <mode>):
//   (none)          agents (`npm run notes`): refresh facts, create missing notes
//   approve <name…> agents: mark notes approved after the designer says so
//   staged          pre-commit: refresh facts from the Git index and stage them
//   check           fail on missing/malformed/orphan notes, missing Purpose and
//                   stale facts; list drafts and notes changed since approval
//
// Every message the check prints is written for the designer: what is wrong
// and what to ask the agent. Facts are deterministic: sorted by code point,
// `/` paths, LF line endings, no dates, no machine details.

import ts from "typescript";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, posix } from "node:path";
import { fileURLToPath } from "node:url";
import { samePath } from "./runtime.mjs";
import { gitBlobs } from "./check-scope.mjs";
import { readMarker } from "./check-custom.mjs";

export const APP_NOTE = "design/app.design.md";
export const VIEW_SECTIONS = ["Purpose", "Behaviour for developers", "Why this shape", "Dropped alternatives", "Open questions"];
export const APP_SECTIONS = ["Product", "Rules", "Decisions"];
const BEGIN = "<!-- facts:begin (generated from code; never edit by hand) -->";
const END = "<!-- facts:end -->";
const BEGIN_RE = /^<!-- facts:begin\b.*-->$/u;
const ROUTER = "@tanstack/react-router";
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
const uniq = (values) => [...new Set(values)].sort(cmp);
const lf = (text) => text.replace(/\r\n?/gu, "\n");
const base = (path) => posix.basename(path).replace(/\.(design\.md|tsx?)$/u, "");
export const fingerprint = (text) => createHash("sha256").update(lf(text)).digest("hex").slice(0, 12);

// ---------------------------------------------------------------------------
// Sources: the working tree, or the Git index (what the commit will contain).

const wanted = (p) => /^src\/.+\.(tsx?|design\.md)$/u.test(p) || p.startsWith("design/") || p === ".foundry/library.json";
function walk(cwd, dir, out) {
  const full = resolve(cwd, dir);
  if (!existsSync(full)) return out;
  for (const entry of readdirSync(full, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { if (entry.name !== "node_modules") walk(cwd, path, out); }
    else if (wanted(path)) out.push(path);
  }
  return out;
}
export function treeSource(cwd = process.cwd()) {
  const files = [...walk(cwd, "src", []), ...walk(cwd, "design", []), ...(existsSync(resolve(cwd, ".foundry/library.json")) ? [".foundry/library.json"] : [])].sort(cmp);
  const set = new Set(files);
  return { files, has: (p) => set.has(p), read: (p) => (set.has(p) ? lf(readFileSync(resolve(cwd, p), "utf8")) : null) };
}
function git(cwd, args, input) {
  const r = spawnSync("git", args, { cwd, input, windowsHide: true, shell: false, maxBuffer: 64e6 });
  if (r.error || r.status !== 0) throw Error(`Design notes: git ${args[0]} failed: ${r.stderr?.toString().trim() || r.error}`);
  return r.stdout;
}
export function indexSource(cwd = process.cwd()) {
  const files = git(cwd, ["ls-files", "-z", "--cached"]).toString().split("\0").filter((p) => p && wanted(p)).sort(cmp);
  const blobs = gitBlobs(cwd, files.map((p) => `:${p}`));
  const map = new Map(files.map((p, i) => [p, blobs[i] ? lf(blobs[i].toString("utf8")) : null]));
  const present = files.filter((p) => map.get(p) !== null);
  const set = new Set(present);
  return { files: present, has: (p) => set.has(p), read: (p) => map.get(p) ?? null };
}

// ---------------------------------------------------------------------------
// Parsing project modules.

function resolveIn(src, from, spec) {
  let stem;
  if (spec.startsWith("@/")) stem = "src/" + spec.slice(2);
  else if (spec.startsWith(".")) stem = posix.normalize(posix.join(posix.dirname(from), spec));
  else return null;
  return ["", ".tsx", ".ts", "/index.tsx", "/index.ts"].map((e) => stem + e).find((p) => src.has(p)) ?? null;
}
const unwrap = (n) => {
  while (n && (ts.isAsExpression(n) || ts.isSatisfiesExpression(n) || ts.isParenthesizedExpression(n) || ts.isTypeAssertionExpression(n))) n = n.expression;
  return n;
};
const propName = (p) => (p.name && (ts.isIdentifier(p.name) || ts.isStringLiteralLike(p.name)) ? p.name.text : undefined);
const prop = (obj, name) => {
  const p = obj.properties.find((x) => ts.isPropertyAssignment(x) && propName(x) === name);
  return p ? unwrap(p.initializer) : undefined;
};
const stringOf = (n) => (n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null);
const flat = (text) => text.replace(/\s+/gu, " ").trim();

function moduleInfo(src, path, cache) {
  if (cache.has(path)) return cache.get(path);
  const text = src.read(path);
  const sf = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, path.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const info = { path, text, sf, imports: new Map(), locals: [], tags: [], links: [], marker: readMarker(text) };
  cache.set(path, info);
  for (const st of sf.statements) {
    if (!ts.isImportDeclaration(st) || !st.importClause || st.importClause.isTypeOnly) continue;
    const spec = st.moduleSpecifier.text, file = resolveIn(src, path, spec), clause = st.importClause;
    if (file) info.locals.push(file);
    if (clause.name) info.imports.set(clause.name.text, { spec, file, exported: "default" });
    const nb = clause.namedBindings;
    if (nb && ts.isNamespaceImport(nb)) info.imports.set(nb.name.text, { spec, file, exported: "*" });
    if (nb && ts.isNamedImports(nb)) for (const el of nb.elements) if (!el.isTypeOnly) info.imports.set(el.name.text, { spec, file, exported: (el.propertyName ?? el.name).text });
  }
  for (const st of sf.statements) if (ts.isExportDeclaration(st) && !st.isTypeOnly && st.moduleSpecifier) {
    const file = resolveIn(src, path, st.moduleSpecifier.text);
    if (file) info.locals.push(file);
  }
  // `const go = useNavigate()` — calls of `go({ to })` are navigation exits.
  const navigators = new Set();
  const resolveTag = (tag) => {
    const chain = [];
    let n = tag;
    while (ts.isPropertyAccessExpression(n)) { chain.unshift(n.name.text); n = n.expression; }
    if (!ts.isIdentifier(n)) return null;
    const imp = info.imports.get(n.text);
    if (!imp) return null;
    let name = imp.exported, rest = chain;
    if (name === "*") { name = chain[0]; rest = chain.slice(1); }
    else if (name === "default" && !imp.file && imp.spec.split("/").length > (imp.spec.startsWith("@") ? 2 : 1)) name = imp.spec.split("/").at(-1);
    if (!name || rest.length > 1) return null;
    return { spec: imp.spec, file: imp.file, name, member: rest[0] };
  };
  info.resolveTag = resolveTag;
  const target = (expr) => {
    expr = unwrap(expr);
    if (!expr) return null;
    const s = stringOf(expr);
    if (s !== null) return s;
    if (ts.isTemplateExpression(expr)) return expr.head.text + expr.templateSpans.map((span) => "${…}" + span.literal.text).join("");
    return null;
  };
  const visit = (node) => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      const init = unwrap(node.initializer);
      if (ts.isCallExpression(init) && ts.isIdentifier(init.expression)) {
        const imp = info.imports.get(init.expression.text);
        if (imp?.spec === ROUTER && imp.exported === "useNavigate") navigators.add(node.name.text);
      }
    }
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      const res = resolveTag(node.tagName);
      const element = ts.isJsxOpeningElement(node) ? node.parent : node;
      if (res) info.tags.push({ res, element, attrs: node.attributes });
      if (res && res.spec === ROUTER && (res.name === "Link" || res.name === "Navigate") && !res.member) {
        const to = node.attributes.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === "to");
        const init = to?.initializer;
        const value = !to ? null : init && ts.isJsxExpression(init) ? target(init.expression) : init ? stringOf(init) : null;
        info.links.push({ how: res.name === "Link" ? "link" : "redirect", to: value });
      }
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && navigators.has(node.expression.text)) {
      const arg = unwrap(node.arguments[0]);
      const to = arg && ts.isObjectLiteralExpression(arg) ? prop(arg, "to") : undefined;
      info.links.push({ how: "navigate", to: to ? target(to) : null });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  info.locals = uniq(info.locals);
  return info;
}

const matches = (res, ref) => {
  if (!res || res.name !== ref.name || (res.member ?? null) !== (ref.member ?? null)) return false;
  return ref.from.startsWith("src/") ? res.file === ref.from : !res.file && (res.spec === ref.from || res.spec === `${ref.from}/${ref.name}`);
};

// ---------------------------------------------------------------------------
// Routes.

function readRoutes(src, cache, problems) {
  const path = "src/flows/routes.tsx";
  if (!src.has(path)) { problems.push("The screen list (src/flows/routes.tsx) is missing — ask your agent to restore it."); return []; }
  const info = moduleInfo(src, path, cache);
  let arr;
  for (const st of info.sf.statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations)
    if (ts.isIdentifier(d.name) && d.name.text === "routes") arr = unwrap(d.initializer);
  if (!arr || !ts.isArrayLiteralExpression(arr)) { problems.push("The screen list (src/flows/routes.tsx) could not be read — ask your agent to keep it a plain list of routes."); return []; }
  const routes = [];
  const walkRoutes = (elements, parent) => {
    for (const raw of elements) {
      const el = unwrap(raw);
      if (!ts.isObjectLiteralExpression(el)) { problems.push("The screen list (src/flows/routes.tsx) contains an entry that cannot be read — ask your agent to write every route out in full."); continue; }
      const p = stringOf(prop(el, "path"));
      if (p === null) { problems.push("A route in src/flows/routes.tsx has no plain path — ask your agent to fix it."); continue; }
      const fullPath = ("/" + [parent, p].join("/")).replace(/\/+/gu, "/").replace(/(.)\/$/u, "$1");
      const comp = prop(el, "component");
      const imp = comp && ts.isIdentifier(comp) ? info.imports.get(comp.text) : null;
      const meta = prop(el, "meta");
      const metaText = (key) => (meta && ts.isObjectLiteralExpression(meta) ? stringOf(prop(meta, key)) : null);
      let sample = null;
      const sp = meta && ts.isObjectLiteralExpression(meta) ? prop(meta, "sampleParams") : null;
      if (sp && ts.isObjectLiteralExpression(sp)) sample = Object.fromEntries(sp.properties.filter(ts.isPropertyAssignment).map((x) => [propName(x), stringOf(unwrap(x.initializer))]).filter(([, v]) => v !== null));
      routes.push({ fullPath, file: imp?.file ?? null, flow: metaText("flow"), role: metaText("role"), sample });
      const kids = prop(el, "children");
      if (kids && ts.isArrayLiteralExpression(kids)) walkRoutes(kids.elements, fullPath);
    }
  };
  walkRoutes(arr.elements, "");
  return routes;
}
const segments = (p) => p.split(/[?#]/u)[0].split("/").filter(Boolean);
function routeFor(routes, to) {
  if (to === null || !to.startsWith("/")) return null;
  const t = segments(to);
  let best = null, bestScore = -1;
  for (const r of routes) {
    const s = segments(r.fullPath);
    if (s.length !== t.length) continue;
    let score = 0, ok = true;
    for (let i = 0; i < s.length && ok; i++) {
      const wild = t[i].includes("${…}") || t[i].startsWith("$");
      if (s[i].startsWith(":")) continue;
      if (wild) continue;
      if (s[i] === t[i]) score++; else ok = false;
    }
    if (ok && score > bestScore) { best = r; bestScore = score; }
  }
  return best;
}

// ---------------------------------------------------------------------------
// The model: every view and its facts.

function propsOf(info) {
  const { sf } = info;
  const name = base(info.path);
  const decls = new Map();
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.name) decls.set(st.name.text, st);
    if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) decls.set(d.name.text, d);
  }
  let target = null;
  for (const st of sf.statements) {
    if (ts.isFunctionDeclaration(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.DefaultKeyword)) target = st;
    if (ts.isExportAssignment(st) && !st.isExportEquals) {
      const e = unwrap(st.expression);
      target = ts.isIdentifier(e) ? decls.get(e.text) ?? null : e;
    }
  }
  target ??= decls.get(name) ?? null;
  if (!target) return "not readable (no default export)";
  let fn = target, annotated = null;
  if (ts.isVariableDeclaration(target)) {
    annotated = target.type && ts.isTypeReferenceNode(target.type) ? target.type.typeArguments?.[0] : null;
    fn = unwrap(target.initializer);
  }
  while (fn && ts.isCallExpression(fn)) fn = unwrap(fn.arguments[0]); // memo(), forwardRef()
  if (!fn || !(ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn))) return "not readable";
  const param = fn.parameters[0];
  const type = param?.type ?? annotated;
  if (!param && !annotated) return "none";
  if (!type) {
    if (param && ts.isObjectBindingPattern(param.name)) return "untyped: " + param.name.elements.map((e) => e.name.getText(sf)).join(", ");
    return "not readable (no props type)";
  }
  const types = new Map();
  for (const st of sf.statements) {
    if (ts.isTypeAliasDeclaration(st) || ts.isInterfaceDeclaration(st)) types.set(st.name.text, st);
  }
  const members = (node, seen = new Set()) => {
    if (ts.isTypeLiteralNode(node)) return node.members.map((m) => flat(m.getText(sf)).replace(/[;,]$/u, ""));
    if (ts.isIntersectionTypeNode(node)) return node.types.flatMap((t) => members(t, seen));
    if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName) && types.has(node.typeName.text) && !seen.has(node.typeName.text)) {
      seen.add(node.typeName.text);
      const decl = types.get(node.typeName.text);
      if (ts.isTypeAliasDeclaration(decl)) return members(decl.type, seen);
      const heritage = (decl.heritageClauses ?? []).flatMap((h) => h.types.map((t) => `extends ${flat(t.getText(sf))}`));
      return [...heritage, ...decl.members.map((m) => flat(m.getText(sf)).replace(/[;,]$/u, ""))];
    }
    return [`${flat(node.getText(sf))}`];
  };
  const list = members(type);
  return list.length ? list.map((m) => "`" + m + "`").join("; ") : "none";
}

function stepsOf(info, tag, spec) {
  const { sf } = info;
  const attr = (attrs, name) => attrs.properties.find((a) => ts.isJsxAttribute(a) && a.name.getText(sf) === name);
  const attrValue = (a) => {
    if (!a?.initializer) return null;
    return ts.isJsxExpression(a.initializer) ? unwrap(a.initializer.expression) : a.initializer;
  };
  const textOf = (node) => {
    const parts = [];
    const visit = (n) => {
      if (ts.isJsxText(n)) parts.push(n.text);
      else if (ts.isJsxExpression(n) && n.expression && stringOf(unwrap(n.expression)) !== null) parts.push(stringOf(unwrap(n.expression)));
      else ts.forEachChild(n, visit);
    };
    visit(node);
    return flat(parts.join(" "));
  };
  let labels = [];
  if (spec.items) {
    let value = attrValue(attr(tag.attrs, spec.items.prop));
    if (value && ts.isIdentifier(value)) {
      for (const st of sf.statements) if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations)
        if (ts.isIdentifier(d.name) && d.name.text === value.text) value = unwrap(d.initializer);
    }
    if (!value || !ts.isArrayLiteralExpression(value)) return "not readable (the steps are built from data)";
    labels = value.elements.map((e) => {
      e = unwrap(e);
      return (e && ts.isObjectLiteralExpression(e) && stringOf(prop(e, spec.items.label))) || "(label not readable)";
    });
  } else if (spec.count) {
    const value = attrValue(attr(tag.attrs, spec.count));
    return value && ts.isNumericLiteral(value) ? `${value.text} steps without labels` : "not readable (the step count is computed)";
  } else {
    const within = new Set();
    const collect = (n) => { within.add(n); ts.forEachChild(n, collect); };
    collect(tag.element);
    for (const step of info.tags.filter((t) => t !== tag && within.has(t.element) && spec.element.some((ref) => matches(t.res, ref)))) {
      let label = "";
      if (spec.label.child) {
        const inner = new Set();
        const c = (n) => { inner.add(n); ts.forEachChild(n, c); };
        c(step.element);
        const child = info.tags.find((t) => inner.has(t.element) && matches(t.res, spec.label.child));
        if (child) label = textOf(child.element);
      }
      if (!label && spec.label.prop) {
        const v = attrValue(attr(step.attrs, spec.label.prop));
        label = (v && (stringOf(v) ?? (ts.isJsxText(v) ? flat(v.text) : null))) || "";
      }
      labels.push(label || "(label not readable)");
    }
    if (!labels.length) return "none found in the file (the steps may be built from data)";
  }
  return labels.map((l, i) => `${i + 1}. ${l}`).join(" · ");
}

export function analyze(src) {
  const problems = [];
  const cache = new Map();
  const lib = src.has(".foundry/library.json") ? JSON.parse(src.read(".foundry/library.json")) : null;
  if (!lib?.views) throw Error("Design notes need the library's view kinds in .foundry/library.json — ask a developer to restore the shipped file.");
  const libraryModules = lib.custom?.modules ?? [];
  const isLibraryModule = (p) => libraryModules.some((m) => (m.endsWith("/") ? p.startsWith(m) : p === m));
  const label = (ref) => `${lib.library} ${ref.name}`;
  const routes = readRoutes(src, cache, problems);
  const isSystem = (p) => p.slice("src/flows/".length).split("/").slice(0, -1).some((s) => s.startsWith("_"));
  const candidates = src.files.filter((p) => /^src\/flows\/.+\.tsx$/u.test(p) && p !== "src/flows/routes.tsx" && !/\.(stories|test)\.tsx$/u.test(p) && !isSystem(p));
  const views = new Map();
  for (const path of candidates) {
    const info = moduleInfo(src, path, cache);
    const found = (kind) => {
      for (const t of info.tags) for (const ref of lib.views[kind].components) if (matches(t.res, ref)) return { tag: t, ref };
      return null;
    };
    const wizard = found("wizard"), modal = found("modal"), drawer = found("drawer");
    const own = routes.filter((r) => r.file === path);
    let kind = null, kindText = null;
    if (wizard) {
      kind = "wizard";
      kindText = `wizard (${label(wizard.ref)})` + (own.length ? " on a page" : modal ? ` in a modal (${label(modal.ref)})` : drawer ? ` in a drawer (${label(drawer.ref)})` : "");
    } else if (own.length) {
      kind = "page";
      const inline = uniq([modal && `modal (${label(modal.ref)})`, drawer && `drawer (${label(drawer.ref)})`].filter(Boolean));
      kindText = "page" + (inline.length ? `, with an inline ${inline.join(" and an inline ")}` : "");
    } else if (modal) { kind = "modal"; kindText = `modal (${label(modal.ref)})`; }
    else if (drawer) { kind = "drawer"; kindText = `drawer (${label(drawer.ref)})`; }
    if (kind) views.set(path, { path, name: base(path), kind, kindText, routes: own, info, wizard });
  }
  // Everything a view reaches through its own helpers (not other views, not the library).
  const reach = (view) => {
    const seen = new Set([view.path]), order = [view.path];
    for (let i = 0; i < order.length; i++) for (const next of moduleInfo(src, order[i], cache).locals) {
      if (seen.has(next) || views.has(next) || isLibraryModule(next) || /\.(stories|test)\.tsx?$/u.test(next) || !/^src\//u.test(next)) continue;
      seen.add(next); order.push(next);
    }
    return order;
  };
  for (const view of views.values()) {
    view.reach = reach(view);
    view.exits = [];
    view.opens = [];
    for (const p of view.reach) {
      const info = moduleInfo(src, p, cache);
      for (const link of info.links) {
        const route = routeFor(routes, link.to);
        view.exits.push({ how: link.how, to: link.to, route, target: route?.file && views.get(route.file) ? route.file : null });
      }
      for (const t of info.tags) if (t.res.file && views.has(t.res.file) && t.res.file !== view.path && views.get(t.res.file).kind !== "page") view.opens.push(t.res.file);
    }
    view.opens = uniq(view.opens);
  }
  for (const view of views.values()) {
    view.openedFrom = [];
    for (const other of views.values()) {
      if (other === view) continue;
      for (const e of other.exits) if (e.target === view.path) view.openedFrom.push(`${other.name} (${e.how})`);
      if (other.opens.includes(view.path)) view.openedFrom.push(`${other.name} (opens it)`);
    }
    view.openedFrom = uniq(view.openedFrom);
  }
  const folderOf = (p) => p.split("/")[2];
  const roles = new Map();
  const roleOf = (view, seen = new Set()) => {
    if (roles.has(view.path)) return roles.get(view.path);
    if (view.routes.length) { const r = uniq(view.routes.map((x) => x.role).filter(Boolean)); roles.set(view.path, r); return r; }
    if (seen.has(view.path)) return [];
    seen.add(view.path);
    const openers = [...views.values()].filter((o) => o.opens.includes(view.path) || o.exits.some((e) => e.target === view.path));
    const r = uniq(openers.flatMap((o) => roleOf(o, seen)));
    roles.set(view.path, r);
    return r;
  };
  const stories = src.files.filter((p) => /^src\/.+\.stories\.tsx$/u.test(p)).map((p) => {
    const info = moduleInfo(src, p, cache);
    const names = [];
    for (const st of info.sf.statements) if (ts.isVariableStatement(st) && st.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword))
      for (const d of st.declarationList.declarations) if (ts.isIdentifier(d.name)) names.push(d.name.text);
    return { path: p, imports: info.locals, names };
  });
  for (const view of views.values()) {
    const code = (t) => "`" + t + "`";
    const facts = [];
    facts.push(["View", `${view.name} (${code(view.path)})`]);
    facts.push(["Kind", view.kindText]);
    const openerNames = uniq(view.openedFrom.map((o) => o.replace(/ \(.*\)$/u, "")));
    facts.push(["Route", view.routes.length
      ? uniq(view.routes.map((r) => {
        const sample = r.sample && Object.keys(r.sample).length ? r.fullPath.replace(/:([A-Za-z_][\w]*)/gu, (m, k) => r.sample[k] ?? m) : null;
        return code(r.fullPath) + (sample && sample !== r.fullPath ? ` (sample ${code(sample)})` : "");
      })).join("; ")
      : openerNames.length ? `none (opens over ${openerNames.join(", ")})` : "none"]);
    const flows = view.routes.length ? uniq(view.routes.map((r) => r.flow).filter(Boolean))
      : uniq([...views.values()].filter((v) => v.routes.length && folderOf(v.path) === folderOf(view.path)).flatMap((v) => v.routes.map((r) => r.flow).filter(Boolean)));
    facts.push(["Flow", flows.length ? flows.join(", ") : view.routes.length ? "not set" : "not set (no page in this flow folder yet)"]);
    const role = roleOf(view);
    facts.push(["Role", role.length ? role.join(", ") : "not set"]);
    facts.push(["Opened from", view.openedFrom.length ? view.openedFrom.join("; ") : view.kind === "page" || view.routes.length ? "nothing links here yet (reachable by its address and the DevBar)" : "nothing opens it yet"]);
    const exits = uniq([
      ...view.exits.map((e) => {
        if (e.to === null) return `a computed address (${e.how})`;
        const where = code(e.to);
        if (e.target) return `${views.get(e.target).name} (${e.how} to ${where})`;
        if (e.route) return `${where} (${e.how}; no screen at this route)`;
        return `${where} (${e.how}; no route matches)`;
      }),
      ...view.opens.map((p) => `${views.get(p).name} (opens it)`),
    ]);
    if (view.kind === "modal" || view.kind === "drawer" || (view.kind === "wizard" && !view.routes.length)) exits.push("closes back to the screen that opened it");
    facts.push(["Exits", exits.length ? exits.join("; ") : "none"]);
    if (view.kind === "wizard") facts.push(["Steps", stepsOf(view.info, view.wizard.tag, view.wizard.ref.steps)]);
    const own = stories.filter((s) => s.imports.includes(view.path));
    facts.push(["States", own.length ? own.map((s) => `${s.names.join(", ") || "no named stories"} (${code(s.path)})`).join("; ") : "no stories yet"]);
    facts.push(["Data", propsOf(view.info)]);
    const custom = view.reach.map((p) => moduleInfo(src, p, cache)).filter((i) => i.marker && !i.marker.error).map((i) => `${base(i.path)} (${code(i.path)})`);
    facts.push(["Custom components", custom.length ? uniq(custom).join("; ") : "none"]);
    view.facts = [BEGIN, ...facts.map(([k, v]) => `- **${k}:** ${v}`), END].join("\n");
    view.fingerprint = fingerprint(view.info.text);
  }
  return { views, problems, library: lib.library };
}

// ---------------------------------------------------------------------------
// Note files.

const ordinal = (kind) => ({ page: "page", modal: "modal", drawer: "drawer", wizard: "wizard" })[kind];
export function skeleton(view) {
  return `# ${view.name}

Status: draft

${view.facts}

## Purpose
<!-- Required. Why this ${ordinal(view.kind)} exists: who uses it and what they get done here. -->

## Behaviour for developers
<!-- Rules to implement: when actions are enabled or disabled, what happens after each action, errors. -->

## Why this shape
<!-- Why this layout and these controls, and not others. -->

## Dropped alternatives
<!-- Options considered and rejected, and why. -->

## Open questions
<!-- Anything still undecided. -->
`;
}
export const APP_SKELETON = `# App design

Status: draft

## Product
<!-- Who the product is for and what they do with it. Your agent drafts this with you after setup. -->

## Rules
<!-- Your preferences that every agent MUST follow, one per line and numbered, e.g.
- **R1** No checkboxes: use switches. (2026-11-04)
-->

## Decisions
<!-- Recurring choices lifted from screens, with the screens that use them, e.g.
- **D1** Detail screens open as full pages, not drawers. Used by: LoanDetailsScreen.
-->
`;

const DATE = /^\d{4}-\d{2}-\d{2}$/u;
const realDate = (d) => DATE.test(d) && new Date(d + "T00:00:00Z").toISOString().slice(0, 10) === d;
/** Parse a note; returns { problems[], status, facts?, sections } — problems are short phrases. */
export function parseNote(text, { title, sections, facts }) {
  const lines = lf(text).split("\n");
  const problems = [];
  let i = 0;
  while (i < lines.length && !lines[i].trim()) i++;
  const heading = lines[i] ?? "";
  if (!heading.startsWith("# ")) problems.push("it does not start with a title");
  else if (title && heading.slice(2).trim() !== title) problems.push(`its title is not "${title}"`);
  i++;
  while (i < lines.length && !lines[i].trim()) i++;
  const statusLine = lines[i] ?? "";
  let status = null;
  const m = /^Status: (draft|approved (\d{4}-\d{2}-\d{2})(?: · ([a-f0-9]{12}))?)$/u.exec(statusLine.trim());
  if (!m) problems.push('its "Status:" line is missing or not "draft" / "approved <date>"');
  else if (m[1] === "draft") status = { approved: false };
  else if (!realDate(m[2])) problems.push("its approval date is not a real date");
  else if (facts && !m[3]) problems.push("its approval is missing the code fingerprint");
  else if (!facts && m[3]) problems.push("its approval has a code fingerprint, which only screen notes carry");
  else status = { approved: true, date: m[2], fingerprint: m[3] ?? null };
  const begins = lines.flatMap((l, n) => (BEGIN_RE.test(l.trim()) ? [n] : []));
  const ends = lines.flatMap((l, n) => (l.trim() === END ? [n] : []));
  const firstSection = lines.findIndex((l) => l.startsWith("## "));
  let block = null;
  if (facts) {
    if (begins.length !== 1 || ends.length !== 1 || begins[0] > ends[0]) problems.push("its facts block is missing or broken");
    else if (firstSection >= 0 && ends[0] > firstSection) problems.push("its facts block is not above the first section");
    else block = { start: begins[0], end: ends[0], text: lines.slice(begins[0], ends[0] + 1).join("\n") };
  } else if (begins.length || ends.length) problems.push("it has a facts block, which only screen notes carry");
  const inFacts = (n) => block && n >= block.start && n <= block.end;
  let fence = false;
  const found = [];
  lines.forEach((l, n) => {
    if (/^\s*(```|~~~)/u.test(l)) fence = !fence;
    if (!fence && !inFacts(n) && /^## /u.test(l)) found.push({ name: l.slice(3).trim(), line: n });
  });
  const names = found.map((s) => s.name);
  for (const s of sections) if (!names.includes(s)) problems.push(`it is missing the "${s}" section`);
  for (const s of uniq(names.filter((n, k) => names.indexOf(n) !== k))) problems.push(`it has the "${s}" section twice`);
  for (const s of uniq(names.filter((n) => !sections.includes(n)))) problems.push(`it has an unexpected section "${s}"`);
  if (!problems.length && names.join("\n") !== sections.join("\n")) problems.push(`its sections are not in the order ${sections.join(", ")}`);
  const content = {};
  found.forEach((s, k) => {
    const body = lines.slice(s.line + 1, found[k + 1]?.line ?? lines.length).join("\n");
    content[s.name] = body.replace(/<!--[\s\S]*?-->/gu, "").trim();
  });
  return { problems, status, block, content };
}
export function replaceFacts(text, facts) {
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const lines = lf(text).split("\n");
  const start = lines.findIndex((l) => BEGIN_RE.test(l.trim())), end = lines.findIndex((l) => l.trim() === END);
  if (start < 0 || end < start) return null;
  return [...lines.slice(0, start), ...facts.split("\n"), ...lines.slice(end + 1)].join("\n").replace(/\n/gu, eol);
}

// ---------------------------------------------------------------------------
// The check. Messages are for the designer: what is wrong, what to ask.

export function checkNotes(src) {
  const { views, problems } = analyze(src);
  const errors = [...problems], drafts = [], changed = [];
  const noteOf = (view) => view.path.replace(/\.tsx$/u, ".design.md");
  const notes = src.files.filter((p) => p.endsWith(".design.md") && p !== APP_NOTE);
  const viewByNote = new Map([...views.values()].map((v) => [noteOf(v), v]));
  for (const view of [...views.values()].sort((a, b) => cmp(a.path, b.path))) {
    const what = `${view.name} (${view.kind})`;
    const path = noteOf(view);
    if (!src.has(path)) { errors.push(`${what} has no design note — ask your agent to write it.`); continue; }
    const note = parseNote(src.read(path), { title: view.name, sections: VIEW_SECTIONS, facts: true });
    if (note.problems.length) { errors.push(`${view.name}'s design note is not in the expected shape: ${note.problems.join("; ")} — ask your agent to fix the note.`); continue; }
    if (!note.content.Purpose) errors.push(`${view.name}'s design note has no Purpose — ask your agent to write why this ${view.kind} exists.`);
    if (note.block.text !== view.facts) errors.push(`${view.name}'s design note has outdated facts — ask your agent to refresh the design notes.`);
    if (!note.status.approved) drafts.push(what);
    else if (note.status.fingerprint !== view.fingerprint) changed.push(`${what}, approved ${note.status.date}`);
  }
  for (const path of notes) if (!viewByNote.has(path)) {
    const screen = path.replace(/\.design\.md$/u, ".tsx");
    errors.push(src.has(screen)
      ? `${posix.basename(path)} describes ${base(path)}, which is not a page, modal, drawer or wizard — ask your agent to move the note to the right screen or delete it.`
      : `${posix.basename(path)} describes a screen that no longer exists (${screen}) — ask your agent to move the note to the renamed screen or delete it.`);
  }
  if (!src.has(APP_NOTE)) errors.push(`The app design note (${APP_NOTE}) is missing — ask your agent to restore it.`);
  else {
    const app = parseNote(src.read(APP_NOTE), { sections: APP_SECTIONS, facts: false });
    if (app.problems.length) errors.push(`The app design note (${APP_NOTE}) is not in the expected shape: ${app.problems.join("; ")} — ask your agent to fix it.`);
    else if (!app.status.approved) drafts.unshift("App design (the global note)");
  }
  return { errors, drafts, changed, views: views.size };
}
export function report(src) {
  const { errors, drafts, changed, views } = checkNotes(src);
  console.log(`Design notes: ${views} screen${views === 1 ? "" : "s"} with notes required.`);
  if (drafts.length) console.log(`Design notes waiting for your approval (ask your agent to go through them with you):\n${drafts.map((d) => `  - ${d}`).join("\n")}`);
  if (changed.length) console.log(`Approved design notes whose screen changed since you approved them (ask your agent to show them to you again):\n${changed.map((d) => `  - ${d}`).join("\n")}`);
  if (errors.length) throw Error(`\n✖ design notes check failed:\n${errors.map((e) => `   - ${e}`).join("\n")}\n`);
  return { errors, drafts, changed };
}

// Pre-commit: rebuild facts from the index; stage only the facts change, and
// mirror it into the working-tree file without staging unstaged edits.
export function refreshStaged(cwd = process.cwd()) {
  const src = indexSource(cwd);
  const { views } = analyze(src);
  let count = 0;
  for (const view of views.values()) {
    const path = view.path.replace(/\.tsx$/u, ".design.md");
    const staged = src.read(path);
    if (staged === null) continue;
    const next = replaceFacts(staged, view.facts);
    if (next === null || next === staged) continue;
    const mode = git(cwd, ["ls-files", "-s", "--", path]).toString().split(" ")[0] || "100644";
    const sha = git(cwd, ["hash-object", "-w", "--stdin"], Buffer.from(next)).toString().trim();
    git(cwd, ["update-index", "--cacheinfo", `${mode},${sha},${path}`]);
    const file = resolve(cwd, path);
    if (existsSync(file)) {
      const wt = replaceFacts(readFileSync(file, "utf8"), view.facts);
      if (wt !== null) writeFileSync(file, wt);
    }
    count++;
  }
  if (count) console.log(`Design notes: updated the facts in ${count} note${count === 1 ? "" : "s"}.`);
  return count;
}

// Agents (`npm run notes`): refresh facts everywhere, create missing notes.
export function writeNotes(cwd = process.cwd()) {
  const src = treeSource(cwd);
  const { views } = analyze(src);
  const created = [], refreshed = [];
  for (const view of views.values()) {
    const path = view.path.replace(/\.tsx$/u, ".design.md"), file = resolve(cwd, path);
    if (!src.has(path)) { writeFileSync(file, skeleton(view)); created.push(path); continue; }
    const text = readFileSync(file, "utf8"), next = replaceFacts(text, view.facts);
    if (next !== null && next !== text) { writeFileSync(file, next); refreshed.push(path); }
  }
  if (!src.has(APP_NOTE)) { mkdirSync(resolve(cwd, "design"), { recursive: true }); writeFileSync(resolve(cwd, APP_NOTE), APP_SKELETON); created.push(APP_NOTE); }
  for (const p of created) console.log(`Created ${p} — write its Purpose (and the other sections you know).`);
  for (const p of refreshed) console.log(`Refreshed facts in ${p}.`);
  if (!created.length && !refreshed.length) console.log("Design notes: facts are up to date.");
  return { created, refreshed };
}

const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
// Agents, after the designer approves: `npm run notes -- approve LoanDetailsScreen app`.
export function approveNotes(cwd, names, date = today()) {
  if (!names.length) throw Error("Name the notes to approve: a screen name (e.g. LoanDetailsScreen) or app.");
  const src = treeSource(cwd);
  const { views } = analyze(src);
  for (const name of names) {
    let path, view = null;
    if (name === "app") path = APP_NOTE;
    else {
      const matchesName = [...views.values()].filter((v) => v.name === name || v.path === name);
      if (matchesName.length !== 1) throw Error(matchesName.length ? `${name} is ambiguous: ${matchesName.map((v) => v.path).join(", ")} — pass the file path.` : `${name} is not a page, modal, drawer or wizard.`);
      view = matchesName[0];
      path = view.path.replace(/\.tsx$/u, ".design.md");
    }
    const file = resolve(cwd, path);
    if (!existsSync(file)) throw Error(`${path} does not exist; write the note before approving it.`);
    let text = readFileSync(file, "utf8");
    if (view) text = replaceFacts(text, view.facts) ?? text;
    const note = parseNote(text, view ? { title: view.name, sections: VIEW_SECTIONS, facts: true } : { sections: APP_SECTIONS, facts: false });
    if (note.problems.length) throw Error(`${path} cannot be approved: ${note.problems.join("; ")}.`);
    if (view && !note.content.Purpose) throw Error(`${path} cannot be approved without a Purpose.`);
    const status = `Status: approved ${date}${view ? ` · ${view.fingerprint}` : ""}`;
    const eol = text.includes("\r\n") ? "\r\n" : "\n";
    writeFileSync(file, lf(text).replace(/^Status: .*$/mu, status).replace(/\n/gu, eol));
    console.log(`Approved ${path} (${status.slice(8)}).`);
  }
}

if (process.argv[1] && samePath(process.argv[1], fileURLToPath(import.meta.url))) {
  const [mode, ...rest] = process.argv.slice(2);
  try {
    if (mode === "check") { report(treeSource()); console.log("Passed design notes check."); }
    else if (mode === "staged") { refreshStaged(); report(indexSource()); }
    else if (mode === "approve") approveNotes(process.cwd(), rest);
    else if (mode === undefined) { writeNotes(); try { report(treeSource()); } catch (error) { console.error(error.message); process.exitCode = 1; } }
    else throw Error(`Unknown mode ${mode}. Use: (none) | approve <names…> | staged | check`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
