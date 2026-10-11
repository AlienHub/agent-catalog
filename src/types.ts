export type InteractionForm = 'GUI' | 'CLI' | 'IDE 插件' | 'Web' | '浏览器插件' | '小程序';
/** One independently identified application per interaction form and edition. */
export interface CatalogApp {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly vendor: string;
  readonly type: string;
  readonly website: string;
  readonly platforms: readonly string[];
  /** Relative path to a bundled real SVG, or empty when no verified SVG exists. */
  readonly icon: string;
  readonly vendor_id: string;
  readonly product_id: string;
  /** Kept as a one-element tuple for JSON/SDK field compatibility. */
  readonly interfaces: readonly [InteractionForm];
  /** Product/service edition; not a geographic availability guarantee. */
  readonly edition: string;
  /** Original status text, preserved verbatim rather than normalized to boolean. */
  readonly svg_status: string;
}
export interface EvidenceSource { readonly url: string; readonly title: string }
export interface CatalogEvidence {
  readonly notes: string;
  readonly sources: readonly EvidenceSource[];
  readonly verified_at: string;
}
export type FilterValue = string | readonly string[];
/** AND across fields, OR within each array. Empty arrays match no records. */
export interface CatalogFilters {
  readonly vendorId?: FilterValue;
  readonly productId?: FilterValue;
  readonly interface?: FilterValue;
  readonly edition?: FilterValue;
  readonly type?: FilterValue;
  readonly platform?: FilterValue;
  readonly hasSvg?: boolean;
  readonly collection?: string;
}
export interface CatalogMetadata {
  readonly schemaVersion: number;
  readonly dataVersion: string;
  readonly recordCount: number;
  readonly productCount: number;
  readonly vendorCount: number;
  readonly svgRecordCount: number;
  readonly svgFileCount: number;
  readonly missingSvgRecordCount: number;
  readonly verifiedAt: string;
}
export type DeepReadonly<T> = T extends readonly (infer U)[]
  ? readonly DeepReadonly<U>[]
  : T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T;
export type JsonValue = string | number | boolean | null | readonly JsonValue[] | { readonly [key: string]: JsonValue };
