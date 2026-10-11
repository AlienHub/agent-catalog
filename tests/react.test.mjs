import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { apps } from '../dist/esm/index.js';
import { AppIcon } from '../dist/esm/react.js';
const require = createRequire(import.meta.url);
const render = props => renderToStaticMarkup(createElement(AppIcon, props));
test('React icon SSR uses bundled data SVG and accessible default name', () => {
  const html = render({ appId: 'chatgpt', size: 32, loading: 'lazy', className: 'logo' });
  assert(html.includes('data:image/svg+xml;'));
  assert(html.includes('alt="ChatGPT 图标"'));
  assert(html.includes('width="32"') && html.includes('height="32"'));
  assert(html.includes('class="logo"'));
  assert(!html.includes('https://'));
});
test('accessibility supports alt, title and decorative usage', () => {
  assert(render({ appId: 'chatgpt', alt: 'Assistant' }).includes('alt="Assistant"'));
  assert(render({ appId: 'chatgpt', title: 'My title' }).includes('alt="My title"'));
  const decorative = render({ appId: 'chatgpt', decorative: true });
  assert(decorative.includes('alt=""') && decorative.includes('aria-hidden="true"'));
});
test('missing Logos do not masquerade as official marks', () => {
  const appId = apps.find(app => !app.icon).id;
  const html = render({ appId });
  assert(html.includes(`data-icon-fallback="${appId}"`));
  assert(html.includes('role="img"'));
  assert(!html.includes('<img'));
  assert.equal(render({ appId, fallback: null }), '');
  assert(render({ appId, fallback: createElement('b', null, 'Pending') }).includes('<b>Pending</b>'));
  assert(render({ appId: 'unknown-app' }).includes('>?</span>'));
  assert(!render({ appId: 'unknown-app', decorative: true }).includes('aria-label'));
});
test('CommonJS React entry renders identically', () => {
  const cjs = require('../dist/cjs/react.js');
  const props = { appId: 'chatgpt', loading: 'lazy' };
  assert.equal(renderToStaticMarkup(createElement(cjs.AppIcon, props)), render(props));
});

test('React renders bundled PNG with its real MIME type rather than a SVG fallback', () => {
 const html = renderToStaticMarkup(createElement(AppIcon, { appId: 'crush-cli' }));
 assert(html.includes('src="data:image/png;base64,'));
 assert(html.includes('alt="Crush 图标"'));
 assert(!html.includes('data-icon-fallback'));
});
