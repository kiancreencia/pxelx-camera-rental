/** The pxelx mark: a 2x2 pixel grid with one "in focus" pixel. */
export function PixelMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" shapeRendering="crispEdges">
      <rect x="0" y="0" width="9" height="9" fill="var(--ink)" />
      <rect x="11" y="0" width="9" height="9" fill="var(--ink-soft)" opacity="0.55" />
      <rect x="0" y="11" width="9" height="9" fill="var(--ink-soft)" opacity="0.3" />
      <rect x="11" y="11" width="9" height="9" fill="var(--focus)" />
    </svg>
  );
}
