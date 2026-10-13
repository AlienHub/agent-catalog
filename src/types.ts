export type InteractionForm = 'GUI' | 'CLI' | 'IDE 插件' | 'Web' | '浏览器插件' | '小程序';
export type WebDomainRole = 'primary' | 'regional' | 'legacy' | 'alternate';
/** One labeled host for a Web application; host list stays in web_domains. */
export interface WebDomainEntry {
  readonly host: string;
  readonly url: string;
  readonly role: WebDomainRole;
  /** Optional region or legacy note; empty when unused. */
  readonly label: string;
}
/** One independently identified application per interaction form. */
export interface CatalogApp {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly vendor: string;
  readonly type: string;
  readonly website: string;
  /** Actual user-facing Web entry; empty until verified. */
  readonly web_url: string;
  /** Exact hosts; shared hosts require web_url path context. Not API/CDN rules. */
  readonly web_domains: readonly string[];
  /** Labeled hosts; hosts must match web_domains. Empty until verified. */
  readonly web_domain_entries: readonly WebDomainEntry[];
  readonly web_domain_status: 'verified' | 'unverified' | 'self-hosted' | 'not-applicable';
  readonly web_domain_verified_at: string;
  readonly platforms: readonly string[];
  /** Relative path to a bundled original SVG or PNG, or empty when no verified Logo exists. */
  readonly icon: string;
  readonly vendor_id: string;
  readonly product_id: string;
  /** Kept as a one-element tuple for JSON/SDK field compatibility. */
  readonly interfaces: readonly [InteractionForm];
  /** Original status text, preserved verbatim rather than normalized to boolean. */
  readonly svg_status: string;
  /** Official store ID; empty means unverified or not applicable. */
  readonly chrome_extension_id: string;
  readonly edge_extension_id: string;
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
  readonly webDomain?: FilterValue;
  readonly productId?: FilterValue;
  readonly interface?: FilterValue;
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
