import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMarketplace, normalizeMarketplace } from '../scripts/collect-openrouter-apps.mjs';

const app = { id: 42, title: 'Example', main_url: 'https://example.com/', categories: ['cli-agent'] };
const data = { popular: [{ app }], trending: [{ appAnalytics: { app } }], leaderboards: {}, globalRankingMap: { day: [{ app }], week: [{ app: { ...app, id: 43, origin_url: 'https://example.org/', main_url: null } }] } };

test('public server payload is parsed as JSON without executing scripts', () => {
  const html = `<script>throw new Error('never execute')</script><script>self.__next_f.push(${JSON.stringify([1, `5c:${JSON.stringify(['$', '$component', null, { data }])}\n`])})</script>`;
  assert.deepEqual(extractMarketplace(html), data);
  assert.throws(() => extractMarketplace('<script>self.__next_f.push([1,"changed"])</script>'), /changed or missing/);
});

test('candidate discovery deduplicates provider IDs and retains observations without promoting trust', () => {
  const candidates = normalizeMarketplace(data);
  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].review_status, 'candidate');
  assert.deepEqual(candidates[0].observed_lists.map(x => x.list), ['popular', 'trending', 'global:day']);
  assert.equal(candidates[1].reported_url, 'https://example.org/');
  assert.equal(candidates[1].observed_lists[0].position, 1);
  assert(!('tokens' in candidates[0]));
  assert.throws(() => normalizeMarketplace({ ...data, trending: [{ app: { title: 'Bad' } }] }), /Invalid app/);
});
