import { getApp } from './index.js';
import { svgByPath, pngByPath } from './generated-icons.js';
export interface AppIconAsset {
  readonly appId: string;
  /** Portable asset identifier, NOT a URL relative to the consuming website. */
  readonly path: string;
  readonly svg: string;
  readonly dataUri: string;
}
export const iconPaths: readonly string[] = Object.freeze(Object.keys(svgByPath));
export function getIconSvg(path: string): string | undefined {
  return Object.prototype.hasOwnProperty.call(svgByPath, path) ? svgByPath[path] : undefined;
}
export function getIconDataUri(path: string): string | undefined {
  if (Object.prototype.hasOwnProperty.call(pngByPath, path)) return pngByPath[path];
  const svg = getIconSvg(path);
  return svg === undefined ? undefined : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
/** No network, filesystem, bundler SVG loader, or hosted website dependency. */
export function getAppIcon(appId: string): AppIconAsset | undefined {
  const app = getApp(appId);
  if (!app?.icon) return undefined;
  const svg = getIconSvg(app.icon);
  if (svg === undefined) return undefined;
  return Object.freeze({ appId, path: app.icon, svg, dataUri: getIconDataUri(app.icon)! });
}

export interface AppLogoAsset {
  readonly appId: string;
  readonly path: string;
  readonly format: 'SVG' | 'PNG';
  readonly mimeType: 'image/svg+xml' | 'image/png';
  readonly dataUri: string;
}
/** Original SVG or PNG; getAppIcon/getIconSvg retain their SVG-only contract. */
export function getAppLogo(appId: string): AppLogoAsset | undefined {
  const app = getApp(appId);
  if (!app?.icon) return undefined;
  const dataUri = getIconDataUri(app.icon);
  if (!dataUri) return undefined;
  const isSvg = app.icon.endsWith('.svg');
  return Object.freeze({ appId, path: app.icon, format: isSvg ? 'SVG' : 'PNG', mimeType: isSvg ? 'image/svg+xml' : 'image/png', dataUri });
}
