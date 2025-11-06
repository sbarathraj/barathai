#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

function findTestFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip common large dirs
      if (/(^|\\|\/)(node_modules|dist|build|coverage|.git|.cache)(\\|\/|$)/i.test(full)) continue;
      if (findTestFiles(full)) return true;
    } else {
      if (/\.(test|spec)\.(c|m)?[jt]sx?$/i.test(entry.name)) return true;
    }
  }
  return false;
}

const hasTests = findTestFiles(process.cwd());

if (!hasTests) {
  // Exit cleanly without noise
  process.exit(0);
}

const result = spawnSync('npx', ['vitest', 'run'], {
  stdio: 'inherit',
  shell: true,
});
process.exit(result.status ?? 0);


