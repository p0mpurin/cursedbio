/**
 * Responsive layout utilities
 * Resolves desktop vs mobile layout based on viewport
 */
import type { PageLayout, ResponsivePageLayout } from './db'

export const DEFAULT_BREAKPOINT = 768

/** Check if layout is responsive (has desktop + mobile variants) */
export function isResponsiveLayout(layout: PageLayout | ResponsivePageLayout): layout is ResponsivePageLayout {
  return 'desktop' in layout && 'mobile' in layout
}

/** Get the PageLayout to render for a given viewport width */
export function getLayoutForViewport(
  layout: PageLayout | ResponsivePageLayout,
  viewportWidth: number,
  fallbackBreakpoint: number = DEFAULT_BREAKPOINT
): PageLayout {
  if (!isResponsiveLayout(layout)) return layout
  const bp = layout.breakpoint ?? ('responsiveBreakpoint' in layout ? (layout as { responsiveBreakpoint?: number }).responsiveBreakpoint : undefined) ?? fallbackBreakpoint
  return viewportWidth >= bp ? layout.desktop : layout.mobile
}

/** Get customCss from layout */
export function getCustomCssForViewport(
  layout: PageLayout | ResponsivePageLayout,
  viewportWidth: number,
  breakpoint: number = DEFAULT_BREAKPOINT
): string | undefined {
  const active = getLayoutForViewport(layout, viewportWidth, breakpoint)
  return active.canvas.customCss
}

/** Get the layout being edited (for editor) */
export function getEditableLayout(
  layout: PageLayout | ResponsivePageLayout,
  variant: 'desktop' | 'mobile'
): PageLayout {
  if (!isResponsiveLayout(layout)) return layout
  return layout[variant]
}

/** Create a responsive layout from a single PageLayout (both variants same initially) */
export function getDefaultResponsiveLayout(plain: PageLayout): ResponsivePageLayout {
  return {
    version: 3,
    breakpoint: 768,
    desktop: JSON.parse(JSON.stringify(plain)),
    mobile: JSON.parse(JSON.stringify(plain)),
  }
}

/** Update the active variant in a responsive layout */
export function updateLayoutVariant(
  layout: PageLayout | ResponsivePageLayout,
  variant: 'desktop' | 'mobile',
  updated: PageLayout
): PageLayout | ResponsivePageLayout {
  if (!isResponsiveLayout(layout)) return updated
  return { ...layout, [variant]: updated }
}

/** Scale a PageElement from desktop canvas to mobile canvas (position + size) */
function scaleElementToMobile(
  el: import('./db').PageElement,
  desktopCanvas: { width: number; height: number },
  mobileCanvas: { width: number; height: number }
): import('./db').PageElement {
  const sx = mobileCanvas.width / desktopCanvas.width
  const sy = mobileCanvas.height / desktopCanvas.height
  return {
    ...el,
    x: Math.round(el.x * sx),
    y: Math.round(el.y * sy),
    width: Math.max(1, Math.round(el.width * sx)),
    height: Math.max(1, Math.round(el.height * sy)),
    // Preserve numeric props that might need scaling (e.g. avatarSize) - scale by average for fonts
    props: el.props ? { ...el.props } : undefined,
  }
}

/** Cascade desktop layout to mobile: scale all elements proportionally. Keeps mobile canvas, replaces elements. */
export function cascadeDesktopToMobile(
  desktop: PageLayout,
  mobile: PageLayout
): PageLayout {
  const dc = desktop.canvas
  const mc = mobile.canvas
  const scaledElements = desktop.elements.map((el) => scaleElementToMobile(el, dc, mc))
  return {
    ...mobile,
    elements: scaledElements,
  }
}

/** Update layout with cascade: when editing desktop, also sync scaled changes to mobile */
export function updateLayoutWithCascade(
  layout: ResponsivePageLayout,
  variant: 'desktop' | 'mobile',
  updated: PageLayout
): ResponsivePageLayout {
  const next = { ...layout, [variant]: updated }
  if (variant === 'desktop') {
    next.mobile = cascadeDesktopToMobile(updated, layout.mobile)
  }
  return next
}
