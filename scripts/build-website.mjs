import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createZip } from './zip.mjs';
import { validateData } from './validate-data.mjs';
await validateData();

// The website is a view of canonical data. Never keep a second data snapshot
// under website/ or fetch the previous site's ZIP during a build.
const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'website-dist');
const sourceFiles = ['index.html', 'app.js', 'style.css', 'favicon.svg'];
const dataFiles = ['dataset.json', 'evidence.json', 'collections.json', 'schema.json', 'metadata.json'];
const licenses = path.join(root, 'licenses');

const data = {};
for (const filename of dataFiles) {
  data[filename] = JSON.parse(await readFile(path.join(root, 'data', filename), 'utf8'));
}
if (!Array.isArray(data['dataset.json'])) {
  throw new Error('data/dataset.json must contain an array of application records');
}

const indexSource = await readFile(path.join(root, 'website', 'index.html'), 'utf8');

const metadata = data['metadata.json'];
if (!/^\d+(?:\.\d+)*$/.test(metadata.dataVersion) || !/^\d{4}-\d{2}-\d{2}$/.test(metadata.snapshotDate)) {
  throw new Error('Invalid metadata version or snapshot date');
}
const index = indexSource
  .replaceAll('__DATA_VERSION__', metadata.dataVersion)
  .replaceAll('__SNAPSHOT_DATE__', metadata.snapshotDate.replaceAll('-', '.'));

// Check all prerequisites before deleting the previous build.
await Promise.all(sourceFiles.map((filename) => stat(path.join(root, 'website', filename))));
const notices = await readFile(path.join(root, 'THIRD_PARTY_NOTICES.md'), 'utf8');
const licenseFiles = (await readdir(licenses)).filter((filename) => filename.endsWith('.txt')).sort();
if (licenseFiles.length === 0) throw new Error('Original third-party license texts are missing');
const iconFiles = (await readdir(path.join(root, 'assets', 'icons')))
  .filter((filename) => filename.endsWith('.svg'))
  .sort();
const availableIcons = new Set(iconFiles.map((filename) => `icons/${filename}`));
for (const app of data['dataset.json']) {
  if (app.icon && !availableIcons.has(app.icon)) {
    throw new Error(`Missing SVG for ${app.id}: ${app.icon}`);
  }
}

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'icons'), { recursive: true });
await mkdir(path.join(output, 'licenses'), { recursive: true });
await Promise.all([
  writeFile(path.join(output, 'index.html'), index),
  ...sourceFiles.filter((filename) => filename !== 'index.html').map((filename) => cp(path.join(root, 'website', filename), path.join(output, filename))),
  ...dataFiles.map((filename) => cp(path.join(root, 'data', filename), path.join(output, filename))),
  ...iconFiles.map((filename) => cp(path.join(root, 'assets', 'icons', filename), path.join(output, 'icons', filename))),
  ...licenseFiles.map((filename) => cp(path.join(licenses, filename), path.join(output, 'licenses', filename))),
  writeFile(path.join(output, 'THIRD_PARTY_NOTICES.md'), notices.replaceAll('](./data/evidence.json)', '](./evidence.json)')),
]);

// Preserve the original complete dataset download, now generated from canonical files.
const csvKeys = Object.keys(data['schema.json'].items.properties);
const quote = value => '"' + (Array.isArray(value) ? value.join(' | ') : String(value)).replaceAll('"', '""') + '"';
const csv = '\uFEFF' + [csvKeys.map(quote).join(','), ...data['dataset.json'].map(app => csvKeys.map(key => quote(app[key])).join(','))].join('\r\n') + '\r\n';
await writeFile(path.join(output, 'dataset.csv'), csv);
const zipNames = [...dataFiles, 'dataset.csv', 'THIRD_PARTY_NOTICES.md', ...iconFiles.map(name => `icons/${name}`), ...licenseFiles.map(name => `licenses/${name}`)];
const zipEntries = await Promise.all(zipNames.map(async name => ({ name, bytes: await readFile(path.join(output, name)) })));
const zipName = `ai-data-lib-v${metadata.dataVersion}.zip`;
await writeFile(path.join(output, zipName), createZip(zipEntries, metadata.snapshotDate));
console.log(`Built website-dist: ${data['dataset.json'].length} records, ${iconFiles.length} SVGs, ${licenseFiles.length} license texts, ${zipName}`);
