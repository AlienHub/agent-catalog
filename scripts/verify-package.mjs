// Integration verification from a packed tarball and a fresh local Git repository.
import { mkdtemp, writeFile, readFile, cp, rm, readdir, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
const root = fileURLToPath(new URL('../', import.meta.url));
const work = await mkdtemp(join(tmpdir(), 'agent-catalog-verify-'));
const env = { ...process.env, npm_config_cache: process.env.npm_config_cache || join(tmpdir(), 'agent-catalog-npm-cache') };
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', maxBuffer: 15 * 1024 * 1024 });
  if (result.status !== 0) throw Error(`${command} ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
try {
  const packOutput = run('npm', ['pack','--json','--pack-destination',work]);
  // npm can put lifecycle stdout before its JSON result.
  const pack = JSON.parse(packOutput.slice(packOutput.indexOf('[\n')));
  const tarball = join(work, pack[0].filename);
  const paths = pack[0].files.map(file => file.path);
  for (const file of ['dist/esm/index.js','dist/cjs/index.js','dist/esm/react.d.ts','data/dataset.json','data/open-source.json','data/open-source-schema.json','assets/icons/chatgpt.svg','licenses/lobehub.txt','THIRD_PARTY_NOTICES.md']) assert(paths.includes(file), `Missing packed file ${file}`);
  assert(!paths.some(path => /^(?:node_modules|website-dist|\.git)\//.test(path)));
  const fixture = join(work,'consumer'); await cp(join(root,'tests/fixture'),fixture,{ recursive:true });
  run('npm',['install','--no-audit','--no-fund',tarball],fixture);
  assert(!await access(join(fixture,'node_modules/react')).then(() => true, () => false), 'Core-only install must not pull React');
  run(process.execPath,['core.mjs'],fixture);
  run(process.execPath,['core.cjs'],fixture);
  run('npm',['install','--no-audit','--no-fund','--save-dev','typescript@5.9.3','react@19.2.0','react-dom@19.2.0','@types/react@19.2.0','@types/react-dom@19.2.0'],fixture);
  run(process.execPath,[join(fixture,'node_modules/typescript/bin/tsc'),'-p','tsconfig.json'],fixture);
  run(process.execPath,['react.mjs'],fixture);
  const gitSource = join(work,'git-source'); await cp(root,gitSource,{ recursive:true, filter: path => !/\/(?:node_modules|dist|website-dist|\.git|\.verification)(?:\/|$)/.test(path) && !path.endsWith('generated-icons.ts') && !path.endsWith('.tgz') });
  run('git',['init','--initial-branch=main'],gitSource);
  run('git',['add','.'],gitSource);
  run('git',['-c','user.name=SDK packaging test','-c','user.email=test@example.invalid','commit','-m','Verify clean Git dependency prepare'],gitSource);
  const gitFixture = join(work,'git-consumer'); await cp(join(root,'tests/fixture'),gitFixture,{ recursive:true });
  run('npm',['install','--no-audit','--no-fund',`git+file://${gitSource}`],gitFixture);
  run(process.execPath,['core.mjs'],gitFixture);
  run(process.execPath,['core.cjs'],gitFixture);
  const installed = JSON.parse(await readFile(join(gitFixture,'node_modules/@alienhub/agent-atlas/package.json'),'utf8'));
  assert.equal(installed.name,'@alienhub/agent-atlas');
  console.log(`Package verified: ${pack[0].files.length} files, ${pack[0].size} bytes compressed`);
  console.log('PASS: clean core-only tarball install without React, ESM + CJS, TS + React fixture, SVG SSR, raw asset exports, fresh Git prepare install');
} finally {
  if (process.env.KEEP_VERIFY_TEMP) console.log(`Verification fixtures: ${work}`);
  else await rm(work,{ recursive:true, force:true });
}
