import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { apps, getApp, findApps, catalogMeta } from '@alienhub/agent-atlas';
import { getAppIcon, getAppLogo } from '@alienhub/agent-atlas/icons';
const require = createRequire(import.meta.url);
assert.equal(apps.length, 321);
assert.equal(catalogMeta.productCount, 190);
assert.equal(getApp('chatgpt').vendor_id, 'openai');
assert(findApps({ interface: 'CLI' }).length > 0);
assert(getAppIcon('chatgpt').svg.startsWith('<svg'));
assert.equal(require('@alienhub/agent-atlas/dataset.json').length, 321);
assert((await readFile(require.resolve('@alienhub/agent-atlas/icons/chatgpt.svg'),'utf8')).includes('<svg'));

assert.equal(require('@alienhub/agent-atlas/open-source.json')['openclaw-cli'].source_model, 'open-source');
assert.equal(require('@alienhub/agent-atlas/open-source-schema.json').type, 'object');

assert.equal(getAppLogo('crush-cli').format, 'PNG');
assert(getAppLogo('crush-cli').dataUri.startsWith('data:image/png;base64,'));
assert.equal((await readFile(require.resolve('@alienhub/agent-atlas/icons/crush.png'))).subarray(1,4).toString(), 'PNG');
