import { apps, getApp, findApps, catalogMeta, type CatalogApp, type CatalogFilters } from '@alienhub/agent-atlas';
import { AppIcon } from '@alienhub/agent-atlas/react';
import { getAppIcon, type AppIconAsset } from '@alienhub/agent-atlas/icons';
const filters: CatalogFilters = { vendorId: ['openai', 'anthropic'], interface: 'CLI', hasSvg: true };
const results: readonly CatalogApp[] = findApps(filters);
const optionalApp: CatalogApp | undefined = getApp('unknown');
const optionalIcon: AppIconAsset | undefined = getAppIcon('chatgpt');
const view = <AppIcon appId="chatgpt" size={32} title="ChatGPT" fallback={null} />;
// @ts-expect-error canonical records must be readonly
apps[0]!.name = 'mutated';
// @ts-expect-error canonical nested fields must be readonly
apps[0]!.interfaces.push('bad');
// @ts-expect-error result arrays must be readonly
results.push(apps[0]!);
// @ts-expect-error metadata must be readonly
catalogMeta.recordCount = 0;
void [optionalApp, optionalIcon, view];
const oneForm: CatalogApp['interfaces'] = ['IDE 插件'];
// @ts-expect-error one application cannot combine interaction forms
const combinedForms: CatalogApp['interfaces'] = ['GUI', 'CLI'];
// @ts-expect-error legacy form names are not canonical
const legacyForm: CatalogApp['interfaces'] = ['IDE 扩展'];
void [oneForm, combinedForms, legacyForm];
const browserPluginForm: CatalogApp['interfaces'] = ['浏览器插件'];
const miniProgramForm: CatalogApp['interfaces'] = ['小程序'];
void [browserPluginForm, miniProgramForm];
const webDomains: CatalogApp['web_domains'] = ['app.example.com', 'chat.example.com'];
// @ts-expect-error domains must be an array, even for one hostname
const singleDomain: CatalogApp['web_domains'] = 'app.example.com';
// @ts-expect-error canonical domain arrays must be readonly
apps[0]!.web_domains.push('app.example.com');
// @ts-expect-error Web entry URL was removed in Schema v7
const removedWebUrl = apps[0]!.web_url;
void [webDomains, singleDomain, removedWebUrl];
