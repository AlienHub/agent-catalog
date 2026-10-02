const assert = require('node:assert/strict');
const { apps, getApp, searchApps } = require('@alienhub/agent-catalog');
const { getAppIcon } = require('@alienhub/agent-catalog/icons');
assert.equal(apps.length, 212);
assert.equal(getApp('chatgpt').id, 'chatgpt');
assert(searchApps('codex').length > 0);
assert(getAppIcon('chatgpt').dataUri.startsWith('data:image/svg+xml;'));
