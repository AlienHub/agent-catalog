import rawApps from '../data/dataset.json' with { type: 'json' };
import rawEvidence from '../data/evidence.json' with { type: 'json' };
import rawCollections from '../data/collections.json' with { type: 'json' };
import rawSchema from '../data/schema.json' with { type: 'json' };
import sourceMetadata from '../data/metadata.json' with { type: 'json' };
import { deepFreeze } from './freeze.js';
import type { CatalogApp, CatalogEvidence, CatalogFilters, CatalogMetadata, FilterValue, JsonValue } from './types.js';
export type { CatalogApp, InteractionForm, CatalogEvidence, CatalogFilters, CatalogMetadata, EvidenceSource, FilterValue, DeepReadonly, JsonValue } from './types.js';

// validate-data enforces the single-form tuple before every SDK build.
export const apps: readonly CatalogApp[] = deepFreeze(rawApps) as readonly CatalogApp[];
export const evidence: Readonly<Record<string, CatalogEvidence>> = deepFreeze(rawEvidence);
export const collections: Readonly<Record<string, readonly string[]>> = deepFreeze(rawCollections);
export const schema: Readonly<Record<string, JsonValue>> = deepFreeze(rawSchema);
export const catalogMeta: CatalogMetadata = Object.freeze({
  schemaVersion: sourceMetadata.schemaVersion,
  dataVersion: sourceMetadata.dataVersion,
  recordCount: apps.length,
  productCount: new Set(apps.map(app => app.product_id)).size,
  vendorCount: new Set(apps.map(app => app.vendor_id)).size,
  svgRecordCount: apps.filter(app => app.icon.endsWith('.svg')).length,
  svgFileCount: new Set(apps.filter(app => app.icon.endsWith('.svg')).map(app => app.icon)).size,
  missingSvgRecordCount: apps.filter(app => !app.icon).length,
  verifiedAt: sourceMetadata.snapshotDate,
});

const byId = new Map(apps.map(app => [app.id, app]));
const collectionIds = new Map(Object.entries(collections).map(([name, ids]) => [name, new Set(ids)]));
const searchTexts = new Map(apps.map(app => [app.id, normalize([
  app.id, app.name, ...app.aliases, app.vendor, app.vendor_id, app.product_id,
  app.type, app.edition, app.chrome_extension_id, app.edge_extension_id, ...app.interfaces, ...app.platforms,
].join(' '))]));
function normalize(value: string): string { return value.normalize('NFKC').toLowerCase(); }
function matches(actual: string | readonly string[], expected: FilterValue | undefined): boolean {
  if (expected === undefined) return true;
  const accepted = typeof expected === 'string' ? [expected] : expected;
  const values = typeof actual === 'string' ? [actual] : actual;
  return accepted.some(value => values.includes(value));
}
function filterMatch(app: CatalogApp, filters: CatalogFilters): boolean {
  return matches(app.vendor_id, filters.vendorId)
    && matches(app.product_id, filters.productId)
    && matches(app.interfaces, filters.interface)
    && matches(app.edition, filters.edition)
    && matches(app.type, filters.type)
    && matches(app.platforms, filters.platform)
    && (filters.hasSvg === undefined || app.icon.endsWith('.svg') === filters.hasSvg)
    && (filters.collection === undefined || collectionIds.get(filters.collection)?.has(app.id) === true);
}

/** Exact stable ID lookup. Does not guess between product, edition or interface IDs. */
export function getApp(id: string): CatalogApp | undefined { return byId.get(id); }
export function getEvidence(id: string): CatalogEvidence | undefined {
  return Object.prototype.hasOwnProperty.call(evidence, id) ? evidence[id] : undefined;
}
/** Returns a frozen result array in canonical dataset order. */
export function findApps(filters: CatalogFilters = {}): readonly CatalogApp[] {
  return Object.freeze(apps.filter(app => filterMatch(app, filters)));
}
/** Case-insensitive substring search; all whitespace-separated terms must match. */
export function searchApps(query: string, filters: CatalogFilters = {}): readonly CatalogApp[] {
  const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
  return Object.freeze(apps.filter(app => filterMatch(app, filters)
    && terms.every(term => searchTexts.get(app.id)!.includes(term))));
}
export function getAppsByVendor(vendorId: string): readonly CatalogApp[] { return findApps({ vendorId }); }
export function getAppsByProduct(productId: string): readonly CatalogApp[] { return findApps({ productId }); }
/** Unknown collection names return an empty frozen array. */
export function getCollection(name: string): readonly CatalogApp[] { return findApps({ collection: name }); }
