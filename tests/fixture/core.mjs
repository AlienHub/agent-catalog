import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
import { apps, getApp, findApps, catalogMeta } from '@alienhub/agent-catalog';
import { getAppIcon } from '@alienhub/agent-catalog/icons';
const require = createRequire(import.meta.url);
assert.equal(apps.length, 241);
assert.equal(catalogMeta.productCount, 157);
assert.equal(getApp('chatgpt').vendor_id, 'openai');
assert(findApps({ interface: 'CLI' }).length > 0);
assert(getAppIcon('chatgpt').svg.startsWith('<svg'));
assert.equal(require('@alienhub/agent-catalog/dataset.json').length, 241);
assert((await readFile(require.resolve('@alienhub/agent-catalog/icons/chatgpt.svg'),'utf8')).includes('<svg'));

assert.equal(require('@alienhub/agent-catalog/open-source.json')['openclaw-cli'].source_model, 'open-source');
assert.equal(require('@alienhub/agent-catalog/open-source-schema.json').type, 'object');
