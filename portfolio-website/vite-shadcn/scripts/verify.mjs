import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, runBin, samePath } from './runtime.mjs';
import { checkCatalog } from './catalog.mjs';

export async function bundleAndStories(cwd=process.cwd()) {
  const walk=async dir=>{
    for(const entry of await readdir(dir,{withFileTypes:true})) {
      const path=resolve(dir,entry.name);
      if(entry.isDirectory())await walk(path);
      else if(entry.name.endsWith('.js')) {
        const text=await readFile(path,'utf8');
        for(const marker of ['Jump to screen','Flow map','localhost:6006']) {
          if(text.includes(marker))throw Error(`DevBar marker leaked into production: ${marker} (${path})`);
        }
      }
    }
  };
  await walk(resolve(cwd,'dist'));
  const index=JSON.parse(await readFile(resolve(cwd,'storybook-static/index.json')));
  const {storyIds}=JSON.parse(await readFile(resolve(cwd,'.foundry/library.json')));
  for(const id of storyIds) {
    if(!index.entries[id])throw Error(`Missing built Storybook id: ${id}`);
  }
  await checkCatalog(cwd,index,storyIds);
  // Loaded on use: it needs the project's installed TypeScript.
  const { customComponents, assertCustomStories } = await import('./check-custom.mjs');
  assertCustomStories(index,customComponents(cwd).components);
}
export async function verify(cwd=process.cwd()) {
  for(const [name,args]of [
    ['typescript',['-b','--noEmit']], ['eslint',['.','--max-warnings=0']],
    ['vite',['build']], ['storybook',['build','--disable-telemetry']],
  ]) {
    const t=Date.now();
    console.log(`Checking ${name} ${args.join(' ')}…`);
    runBin(name,args,{cwd});
    console.log(`Passed ${name} (${Date.now()-t} ms)`);
  }
  for (const script of ['check-domains', 'check-params', 'check-props', 'check-custom']) {
    const t=Date.now();
    run(process.execPath,[`scripts/${script}.mjs`],{cwd});
    console.log(`Passed ${script} (${Date.now()-t} ms)`);
  }
  const notes=await import('./design-notes.mjs'); // needs the installed TypeScript
  notes.report(notes.treeSource(cwd));
  console.log('Passed design notes check.');
  await bundleAndStories(cwd);
  console.log('Passed DevBar absence, built story ids and Custom stories.');
}
if(process.argv[1] && samePath(process.argv[1],fileURLToPath(import.meta.url))) {
  try {await verify();} catch(error) {console.error(error.message);process.exitCode=1;}
}
