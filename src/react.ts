import { createElement, type ImgHTMLAttributes, type ReactElement, type ReactNode } from 'react';
import { getApp } from './index.js';
import { getAppIcon } from './icons.js';
export interface AppIconProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'width' | 'height' | 'children'> {
  readonly appId: string;
  readonly size?: number | string;
  readonly decorative?: boolean;
  /** Missing/unknown SVG: undefined uses a text initial; null renders nothing. */
  readonly fallback?: ReactNode;
}
/** Renders trusted bundled SVG through <img>, never arbitrary inner HTML. SSR-safe. */
export function AppIcon({ appId, size = 24, decorative = false, fallback, alt, title, style, ...props }: AppIconProps): ReactElement | null {
  const app = getApp(appId);
  const asset = getAppIcon(appId);
  const label = decorative ? '' : (alt ?? title ?? (app ? `${app.name} 图标` : appId));
  if (asset) return createElement('img', {
    ...props,
    src: asset.dataUri,
    alt: label,
    title,
    width: size,
    height: size,
    'aria-hidden': decorative ? true : props['aria-hidden'],
    style: { objectFit: 'contain', ...style },
  });
  if (fallback === null) return null;
  return createElement('span', {
    className: props.className,
    id: props.id,
    title,
    role: decorative ? undefined : 'img',
    'aria-label': decorative ? undefined : label,
    'aria-hidden': decorative ? true : undefined,
    'data-icon-fallback': appId,
    style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, ...style },
  }, fallback === undefined ? (Array.from(app?.name ?? '?')[0] ?? '?') : fallback);
}
