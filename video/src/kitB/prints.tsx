// Footprint / boot-print path builders (merged strings: a whole trail is a handful of <path>s) + polyline helpers.
export type Pt2 = [number, number];

const ellipse = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  const a = [cx - rx * c, cy - rx * s], b = [cx + rx * c, cy + rx * s];
  const deg = ((rot * 180) / Math.PI).toFixed(0);
  return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}A${rx.toFixed(1)} ${ry.toFixed(1)} ${deg} 1 0 ${b[0].toFixed(1)} ${b[1].toFixed(1)}A${rx.toFixed(1)} ${ry.toFixed(1)} ${deg} 1 0 ${a[0].toFixed(1)} ${a[1].toFixed(1)}`;
};
const circ = (cx: number, cy: number, r: number) => `M${(cx - r).toFixed(1)} ${cy.toFixed(1)}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

/** world point from local foot coords (lx sideways, ly forward = negative) */
const loc = (cx: number, cy: number, th: number, s: number, lx: number, ly: number): Pt2 => {
  const c = Math.cos(th), sn = Math.sin(th);
  return [cx + (lx * c - ly * sn) * s, cy + (lx * sn + ly * c) * s];
};

/** bare foot; th = heading in radians (0 = toes point up/-y, +90deg = toes point right); left = mirrored. */
export const footPath = (cx: number, cy: number, th: number, s = 1, left = false) => {
  const m = left ? -1 : 1;
  let d = '';
  const sole = loc(cx, cy, th, s, 0, 0);
  d += ellipse(sole[0], sole[1], 7.2 * s, 13 * s, th);
  const heel = loc(cx, cy, th, s, 0.4 * m, 17);
  d += ellipse(heel[0], heel[1], 5.6 * s, 6 * s, th);
  const toes: [number, number, number][] = [
    [-5.2, -14.2, 3.2], // big toe
    [-1.8, -18.6, 2.5], // second toe, LONGER than the first
    [1.4, -16.4, 2.2],
    [4.0, -13.8, 2.0],
    [6.2, -10.6, 1.8],
  ];
  for (const [tx, ty, r] of toes) {
    const p = loc(cx, cy, th, s, tx * m * -1 * -1, ty);
    d += circ(p[0], p[1], r * s);
  }
  return d;
};

/** boot print: sole + heel (worn = heel flattened on one side) */
export const bootPath = (cx: number, cy: number, th: number, s = 1, worn = false) => {
  let d = '';
  const sole = loc(cx, cy, th, s, 0, -4);
  d += ellipse(sole[0], sole[1], 8.6 * s, 14.5 * s, th);
  const heel = loc(cx, cy, th, s, worn ? -1.6 : 0, 17.5);
  d += ellipse(heel[0], heel[1], (worn ? 4.2 : 7.4) * s, 4.8 * s, th);
  return d;
};

/** polyline helpers */
export const polyLength = (pts: Pt2[]) => {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return l;
};
/** point and heading (rad, 0 = +x) at distance d along polyline */
export const alongPoly = (pts: Pt2[], d: number): {x: number; y: number; ang: number} => {
  let rem = d;
  for (let i = 1; i < pts.length; i++) {
    const sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    if (rem <= sl || i === pts.length - 1) {
      const u = sl ? Math.min(1, rem / sl) : 0;
      return {x: pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * u, y: pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u, ang: Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])};
    }
    rem -= sl;
  }
  return {x: pts[0][0], y: pts[0][1], ang: 0};
};
/** sample a cubic-bezier chain (p0, c1, c2, p1, c1, c2, p1...) into a polyline */
export const bezierChain = (p: Pt2[], n = 24): Pt2[] => {
  const out: Pt2[] = [];
  for (let i = 0; i + 3 < p.length; i += 3) {
    for (let k = i === 0 ? 0 : 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      out.push([
        u * u * u * p[i][0] + 3 * u * u * t * p[i + 1][0] + 3 * u * t * t * p[i + 2][0] + t * t * t * p[i + 3][0],
        u * u * u * p[i][1] + 3 * u * u * t * p[i + 1][1] + 3 * u * t * t * p[i + 2][1] + t * t * t * p[i + 3][1],
      ]);
    }
  }
  return out;
};
