import { run, runBin } from './runtime.mjs';
import { checkScope } from './check-scope.mjs';
try {
  // Loaded on use: they need the project's installed TypeScript (L115).
  const notes = await import('./design-notes.mjs');
  // Facts come from the staged code; the refreshed notes are staged before the scope check sees them.
  notes.refreshStaged();
  checkScope();
  for(const script of ['check-domains','check-params','check-props'])run(process.execPath,[`scripts/${script}.mjs`]);
  // Lists custom components (+ marks those new since HEAD) before failing.
  (await import('./check-custom.mjs')).report();
  // Fails on missing/malformed notes; lists drafts and notes changed since approval.
  notes.report(notes.indexSource());
  runBin('lint-staged', []);
} catch(error) { console.error(error.message); process.exitCode=1; }
