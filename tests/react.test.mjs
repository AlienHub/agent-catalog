import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import { AppIcon } from '../dist/esm/react.js';
const require = createRequire(import.meta.url);
const render = props => renderToStaticMarkup(createElement(AppIcon, props));
test('React icon SSR uses bundled data SVG and accessible default name', () => {
  const html = render({ appId: 'chatgpt', size: 32, loading: 'lazy', className: 'logo' });
  assert(html.includes('data:image/svg+xml;'));
  assert(html.includes('alt="ChatGPT（Web） 图标"'));
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
test('missing SVGs do not masquerade as official marks', () => {
  const html = render({ appId: 'gamma' });
  assert(html.includes('data-icon-fallback="gamma"'));
  assert(html.includes('role="img"'));
  assert(!html.includes('<img'));
  assert.equal(render({ appId: 'gamma', fallback: null }), '');
  assert(render({ appId: 'gamma', fallback: createElement('b', null, 'Pending') }).includes('<b>Pending</b>'));
  assert(render({ appId: 'unknown-app' }).includes('>?</span>'));
  assert(!render({ appId: 'unknown-app', decorative: true }).includes('aria-label'));
});
test('CommonJS React entry renders identically', () => {
  const cjs = require('../dist/cjs/react.js');
  const props = { appId: 'chatgpt', loading: 'lazy' };
  assert.equal(renderToStaticMarkup(createElement(cjs.AppIcon, props)), render(props));
});
