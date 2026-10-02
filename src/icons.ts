import { getApp } from './index.js';
import { svgByPath } from './generated-icons.js';
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
