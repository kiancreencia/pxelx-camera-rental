/* Product art made of pixels: a lens seen head-on, drawn on a 16x12 grid.
   Each camera gets its own variation from its slug, so the catalog reads as a set.
   Used when a camera has no photo yet (image_url is empty). */

const COLS = 16;
const ROWS = 12;

function hash(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function CameraArt({ seed, className = "" }: { seed: string; className?: string }) {
  const h = hash(seed);
  const cx = 7.5 + ((h % 3) - 1) * 0.5; // lens sits slightly off-centre, differently per camera
  const cy = 5.5;
  const barrel = 3.6 + ((h >> 3) % 3) * 0.5;
  const glint = { x: Math.round(cx) + 1 + ((h >> 6) % 2), y: Math.round(cy) - 2 };

  const cells: React.ReactNode[] = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const d = Math.hypot(x - cx, (y - cy) * 1.0);
      let fill = "var(--line)";
      let opacity = 0.35 + (((h >> (x % 16)) ^ (y * 7)) % 5) * 0.06; // quiet background texture
      if (d < barrel + 1.6) {
        fill = "var(--muted)";
        opacity = 0.55;
      }
      if (d < barrel) {
        fill = "var(--ink-soft)";
        opacity = 1;
      }
      if (d < barrel - 1.2) {
        fill = "var(--ink)";
        opacity = 1;
      }
      if (x === glint.x && y === glint.y) {
        fill = "var(--focus)";
        opacity = 1;
      }
      cells.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} opacity={opacity} />);
    }
  }

  return (
    <svg
      viewBox={`0 0 ${COLS} ${ROWS}`}
      className={`block h-full w-full ${className}`}
      shapeRendering="crispEdges"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      {cells}
    </svg>
  );
}
