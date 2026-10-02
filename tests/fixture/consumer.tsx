import { apps, getApp, findApps, catalogMeta, type CatalogApp, type CatalogFilters } from '@alienhub/agent-catalog';
import { AppIcon } from '@alienhub/agent-catalog/react';
import { getAppIcon, type AppIconAsset } from '@alienhub/agent-catalog/icons';
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
