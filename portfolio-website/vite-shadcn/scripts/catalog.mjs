import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createRequire} from 'node:module';

export async function discoverCatalog(cwd,source) {
  const require=createRequire(resolve(cwd,'package.json'));
  // One package lists bare export names; several list package:name.
  if(source.kind==='package-exports'&&source.packages)return source.packages.flatMap(p=>Object.keys(require(p)).map(name=>`${p}:${name}`)).sort();
  if(source.kind==='package-exports')return Object.keys(require(source.package)).sort();
  assert.equal(source.kind,'source-modules','Unknown catalog discovery kind');
  assert.ok(!source.directory.includes('..')&&!/^[\\/]|:/u.test(source.directory),'Catalog directory must be project-relative');
  const ts=require('typescript'),result=[];
  for(const file of (await readdir(resolve(cwd,source.directory),{recursive:true})).map(f=>f.replaceAll('\\','/')).filter(f=>/\.[jt]sx?$/u.test(f)).sort()) {
    const ast=ts.createSourceFile(file,await readFile(resolve(cwd,source.directory,file),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX),names=[];
    for(const node of ast.statements) {
      if(ts.isExportDeclaration(node)) {
        assert.ok(node.exportClause&&ts.isNamedExports(node.exportClause),`UI module requires explicit named exports for inventory: ${file}`);
        for(const item of node.exportClause.elements)names.push(item.name.text);
      }
      else if(node.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)) {
        if(node.name)names.push(node.name.text);
        else if(ts.isVariableStatement(node))for(const declaration of node.declarationList.declarations)names.push(declaration.name.text);
      }
    }
    assert.ok(names.length,`UI module has no declared exports: ${file}`);
    result.push({file,exports:[...new Set(names)].sort()});
  }
  return result;
}

export function assertCatalog(catalog,actual,index,systemIds=[]) {
  assert.equal(catalog.schemaVersion,1,'Unsupported catalog version');
  assert.deepEqual(actual,catalog.discovered,'Installed component/export inventory drifted; review the catalog');
  const named=new Set(),files=new Set(),ids=new Set(),accounted=new Set();
  for(const exclusion of catalog.excluded) {
    assert.ok(typeof exclusion.reason==='string'&&exclusion.reason.trim().length>15,`Missing exclusion reason: ${exclusion.item}`);
    assert.ok(!accounted.has(exclusion.item),`Duplicate exclusion: ${exclusion.item}`);accounted.add(exclusion.item);
  }
  for(const component of catalog.components) {
    assert.ok(!named.has(component.name),`Duplicate component: ${component.name}`);named.add(component.name);
    assert.ok(!files.has(component.file),`Duplicate story file: ${component.file}`);files.add(component.file);
    assert.ok(component.file.startsWith('src/stories/components/')&&component.file.endsWith('.stories.tsx'),'Catalog stories must be designer-owned presentation files');
    assert.ok(!component.file.includes('\\')&&!component.file.split('/').some(p=>!p||p==='.'||p==='..'),'Catalog story path must be portable and stay inside the catalog');
    assert.ok(component.states.length>=2&&new Set(component.states).size===component.states.length,`Declare distinct variants/states for ${component.name}`);
    assert.ok(component.storyIds.some(id=>id.endsWith('--light'))&&component.storyIds.some(id=>id.endsWith('--dark')),`Both theme modes required for ${component.name}`);
    assert.ok(!accounted.has(component.source),`Duplicate inventory binding: ${component.source}`);accounted.add(component.source);
    for(const id of component.storyIds) {
      assert.match(id,/^[a-z][a-z0-9-]*$/u,'Catalog story IDs must be portable');
      assert.ok(!ids.has(id),`Duplicate catalog story id: ${id}`);ids.add(id);
      if(index) {
        const entry=index.entries[id];assert.ok(entry?.type==='story',`Missing catalog story: ${id}`);
        assert.equal(entry.importPath.replace(/^\.\//u,''),component.file,`Wrong story file for ${id}`);
      }
    }
  }
  if(catalog.inventorySource.kind==='package-exports')assert.deepEqual([...accounted].sort(),actual,'Every installed runtime export needs a story or a named nonvisual exclusion');
  else {
    const modules=new Set(actual.map(item=>item.file));
    const bindings=[...catalog.components.map(c=>c.source),...catalog.excluded.filter(e=>modules.has(e.item)).map(e=>e.item)];
    assert.deepEqual(bindings.sort(),[...modules].sort(),'Every UI module needs a component story or named nonvisual exclusion');
    const exports=new Set(actual.flatMap(item=>item.exports.map(name=>item.file+':'+name)));
    for(const exclusion of catalog.excluded)assert.ok(exports.has(exclusion.item)||modules.has(exclusion.item),`Unknown excluded export: ${exclusion.item}`);
  }
  if(index)for(const entry of Object.values(index.entries).filter(e=>e.type==='story'))assert.ok(ids.has(entry.id)||systemIds.includes(entry.id),`Unbound built story: ${entry.id}`);
  return {components:named.size,excluded:catalog.excluded.length,stories:ids.size};
}

export async function checkCatalog(cwd,index,systemIds) {
  const catalog=JSON.parse(await readFile(resolve(cwd,'.foundry/catalog.json')));
  // Generated projects may add designer-owned stories. Foundry separately
  // rejects unbound shipped stories so its exhaustive render sweep cannot omit
  // one; that completeness assertion is not a generated-project role rule.
  const bound=new Set([...(systemIds??[]),...catalog.components.flatMap(c=>c.storyIds)]);
  const declaredIndex=index?{...index,entries:Object.fromEntries(Object.entries(index.entries).filter(([id])=>bound.has(id)))}:index;
  return assertCatalog(catalog,await discoverCatalog(cwd,catalog.inventorySource),declaredIndex,systemIds);
}
