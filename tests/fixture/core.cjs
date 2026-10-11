const assert = require('node:assert/strict');
const { apps, getApp, searchApps } = require('@alienhub/agent-atlas');
const { getAppIcon } = require('@alienhub/agent-atlas/icons');
assert.equal(apps.length, 297);
assert.equal(getApp('chatgpt').id, 'chatgpt');
assert(searchApps('codex').length > 0);
assert(getAppIcon('chatgpt').dataUri.startsWith('data:image/svg+xml;'));

assert.equal(require('@alienhub/agent-atlas/open-source.json').dify.source_model, 'source-available');
