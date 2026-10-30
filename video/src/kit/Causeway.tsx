import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P, clamp01, hash, lerp, rgba, smooth, W, H} from './theme';

export type Footprint = {
  /** position along the road 0 (village) .. 1 (mainland) */
  x: number;
  /** seconds when the print appears */
  t: number;
  size?: 'adult' | 'small';
  /** 'out' = walking toward the mainland (amber), 'in' = returning (teal) */
  dir?: 'out' | 'in';
  /** lateral offset -1..1 within the road */
  lane?: number;
};

export type CausewayProps = {
  mode?: 'map' | 'world';
  /** 0 open .. 1 sea closed over the road */
  tide?: number;
  prints?: Footprint[];
  /** highlight a stretch of road [x0,x1] with an amber ring (map only) */
  highlight?: [number, number];
  /** map-mode frame (px). default fills the screen with margin */
  box?: {x: number; y: number; w: number; h: number};
  /** override current time (seconds) used for footprint reveal */
  now?: number;
  /** show the chart furniture (compass, soundings, grid) */
  chart?: boolean;
  opacity?: number;
};

const printPath = (cx: number, cy: number, rx: number, ry: number, rot: number) => {
  const c = Math.cos(rot), s = Math.sin(rot);
  const ax = cx - rx * c, ay = cy - rx * s, bx = cx + rx * c, by = cy + rx * s;
  const a = `M${ax.toFixed(1)} ${ay.toFixed(1)}A${rx} ${ry} ${((rot * 180) / Math.PI).toFixed(0)} 1 0 ${bx.toFixed(1)} ${by.toFixed(1)}A${rx} ${ry} ${((rot * 180) / Math.PI).toFixed(0)} 1 0 ${ax.toFixed(1)} ${ay.toFixed(1)}`;
  return a;
};

/** Causeway as chart (map) or road in perspective (world). Footprints are merged: 4 paths total regardless of count. */
export const Causeway: React.FC<CausewayProps> = ({mode = 'map', tide = 0, prints = [], highlight, box, now, chart = true, opacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = now ?? frame / fps;
  const b = box ?? {x: 90, y: 150, w: W - 180, h: H - 300};
  const shown = prints.filter((p) => p.t <= t);
  const sound = useMemo(
    () =>
      Array.from({length: 26}, (_, i) => ({
        x: hash(i * 3.7) , y: hash(i * 9.1 + 2), v: 2 + Math.floor(hash(i * 5.3) * 14),
      })),
    [],
  );

  if (mode === 'world') {
    const vp = {x: W / 2, y: 430};
    const rw = 1050;
    const pos = (u: number, lane: number) => {
      const k = Math.pow(1 - u, 1.7); // depth scale 1 near .. 0 far
      const y = vp.y + (H + 40 - vp.y) * k;
      return {x: vp.x + lane * rw * 0.42 * k, y, k};
    };
    const groups: Record<string, string> = {ao: '', ai: '', so: '', si: ''};
    shown.forEach((p, i) => {
      const u = clamp01(p.x);
      const lane = (p.lane ?? 0) + (i % 2 ? 0.07 : -0.07);
      const q = pos(u, lane);
      const small = p.size === 'small';
      const rx = (small ? 7 : 11) * q.k + 0.5;
      const ry = rx * 1.5;
      const key = (small ? 's' : 'a') + (p.dir === 'in' ? 'i' : 'o');
      groups[key] += printPath(q.x, q.y, rx, ry, 0);
    });
    const wob = (y: number, s: number) => Math.sin(y * 0.03 + t * 1.4 + s) * 8;
    // lapping water: from each road edge inward by tide * 45% of the road half width
    let wl = '';
    let wr = '';
    const innerL: string[] = [];
    const innerR: string[] = [];
    const lanes: string[] = [];
    for (let y = vp.y; y <= H + 20; y += 20) {
      const u = (y - vp.y) / (H - vp.y);
      const half = (rw / 2) * u + 6;
      const reach = tide * 0.5 * half * 1.9 * (0.55 + 0.45 * u) + wob(y, 0) * u;
      innerL.push(`${(vp.x - half + reach).toFixed(1)} ${y}`);
      innerR.push(`${(vp.x + half - reach - wob(y, 2) * u).toFixed(1)} ${y}`);
    }
    wl = 'M' + innerL.join('L');
    wr = 'M' + innerR.join('L');
    const wlFill = wl + `L${vp.x - rw / 2 - 40} ${H + 20}L${vp.x - 6} ${vp.y}Z`;
    const wrFill = wr + `L${vp.x + rw / 2 + 40} ${H + 20}L${vp.x + 6} ${vp.y}Z`;
    for (let i = 1; i < 14; i++) {
      const u = Math.pow(i / 14, 1.7);
      const y = vp.y + (H - vp.y) * u;
      lanes.push(`M${vp.x - (rw / 2) * u} ${y}H${vp.x + (rw / 2) * u}`);
    }
    return (
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity}}>
        <defs>
          <linearGradient id="cwroad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1b2742" />
            <stop offset="1" stopColor="#2b3a5c" />
          </linearGradient>
          <linearGradient id="cwsea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#35527f" />
            <stop offset="0.25" stopColor="#1f3562" />
            <stop offset="1" stopColor={P.ink1} />
          </linearGradient>
          <linearGradient id="cwsheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={P.bone} stopOpacity="0" />
            <stop offset="0.5" stopColor={P.teal} stopOpacity="0.18" />
            <stop offset="1" stopColor={P.bone} stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={0} y={vp.y} width={W} height={H - vp.y} fill="url(#cwsea)" />
        <path d={`M${vp.x - 6} ${vp.y} L${vp.x - rw / 2} ${H} L${vp.x + rw / 2} ${H} L${vp.x + 6} ${vp.y}Z`} fill="url(#cwroad)" />
        <path d={lanes.join('')} stroke={P.ink0} strokeWidth={3} opacity={0.55} />
        {Array.from({length: 7}, (_, i) => {
          const u = Math.pow((i + 0.5) / 7, 1.7);
          const y = vp.y + (H - vp.y) * u;
          return <rect key={i} x={vp.x - (rw / 2) * u * 0.9} y={y} width={rw * u * 0.9} height={18 * u + 2} fill="url(#cwsheen)" />;
        })}
        <path d={wlFill} fill={rgba(P.tealDeep, 0.55)} />
        <path d={wrFill} fill={rgba(P.tealDeep, 0.55)} />
        <path d={wl} fill="none" stroke={P.teal} strokeWidth={3} strokeDasharray="30 22" strokeDashoffset={-t * 30} opacity={0.65} />
        <path d={wr} fill="none" stroke={P.teal} strokeWidth={3} strokeDasharray="30 22" strokeDashoffset={t * 30} opacity={0.65} />
        <path d={groups.ao} fill={P.amber} opacity={0.9} />
        <path d={groups.ai} fill={P.teal} opacity={0.9} />
        <path d={groups.so} fill={P.amberHot} opacity={0.9} />
        <path d={groups.si} fill={P.teal} opacity={0.9} />
      </svg>
    );
  }

  // ---- map ----
  const y0 = b.y + b.h * 0.5;
  const rx0 = b.x + 150;
  const rx1 = b.x + b.w - 150;
  const roadAt = (u: number) => ({x: lerp(rx0, rx1, u), y: y0 + Math.sin(u * Math.PI * 1.6) * 22 - 12 * u});
  const roadPts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const r = roadAt(i / 40);
    roadPts.push(`${r.x.toFixed(1)} ${r.y.toFixed(1)}`);
  }
  const road = 'M' + roadPts.join('L');
  const groups: Record<string, string> = {ao: '', ai: '', so: '', si: ''};
  shown.forEach((p, i) => {
    const r = roadAt(clamp01(p.x));
    const small = p.size === 'small';
    const lane = (p.lane ?? 0) * 8 + (i % 2 ? 5 : -5);
    const key = (small ? 's' : 'a') + (p.dir === 'in' ? 'i' : 'o');
    groups[key] += printPath(r.x, r.y + lane, small ? 3.3 : 5, small ? 2.1 : 3.3, p.dir === 'in' ? Math.PI : 0);
  });
  // sea closing from both sides: top & bottom bands advance towards the road centre
  const reach = tide * 0.95;
  const topEdge = b.y + (y0 - b.y) * reach - 6;
  const botEdge = b.y + b.h - (b.y + b.h - y0) * reach + 6;
  const waveLine = (yy: number, ph: number) => {
    let d = '';
    for (let x = b.x; x <= b.x + b.w + 1; x += 20) d += (d ? 'L' : 'M') + x + ' ' + (yy + Math.sin(x * 0.02 + t * 1.2 + ph) * 8).toFixed(1);
    return d;
  };
  const topLine = waveLine(topEdge, 0);
  const botLine = waveLine(botEdge, 2);
  const topFill = topLine + `L${b.x + b.w} ${b.y}L${b.x} ${b.y}Z`;
  const botFill = botLine + `L${b.x + b.w} ${b.y + b.h}L${b.x} ${b.y + b.h}Z`;
  const clipId = 'mapclip';
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity}}>
      <defs>
        <clipPath id={clipId}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} />
        </clipPath>
        <linearGradient id="mapsea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1d3a" />
          <stop offset="0.5" stopColor="#14264b" />
          <stop offset="1" stopColor="#0f1d3a" />
        </linearGradient>
      </defs>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill="url(#mapsea)" />
      <g clipPath={`url(#${clipId})`}>
        {chart && (
          <g stroke={rgba(P.bone, 0.07)} strokeWidth={1}>
            {Array.from({length: 17}, (_, i) => <path key={'v' + i} d={`M${b.x + (i * b.w) / 16} ${b.y}V${b.y + b.h}`} />)}
            {Array.from({length: 9}, (_, i) => <path key={'h' + i} d={`M${b.x} ${b.y + (i * b.h) / 8}H${b.x + b.w}`} />)}
          </g>
        )}
        {chart && [0.16, 0.3, 0.7, 0.84].map((f, i) => (
          <path key={'c' + i} d={`M${b.x + 190} ${b.y + b.h * f} C${b.x + b.w * 0.3} ${b.y + b.h * (f - 0.06)} ${b.x + b.w * 0.6} ${b.y + b.h * (f + 0.07)} ${b.x + b.w - 190} ${b.y + b.h * f}`} fill="none" stroke={rgba(P.bone, 0.1)} strokeWidth={1.4} strokeDasharray={i % 2 ? '4 7' : undefined} />
        ))}
        {/* shores */}
        <path d={`M${b.x} ${b.y} V${b.y + b.h} H${b.x + 190} Q${b.x + 120} ${y0 + 90} ${b.x + 150} ${y0} Q${b.x + 110} ${y0 - 120} ${b.x + 200} ${b.y}Z`} fill="#26324f" />
        <path d={`M${b.x + b.w} ${b.y} V${b.y + b.h} H${b.x + b.w - 190} Q${b.x + b.w - 120} ${y0 + 80} ${b.x + b.w - 150} ${y0} Q${b.x + b.w - 100} ${y0 - 110} ${b.x + b.w - 200} ${b.y}Z`} fill="#26324f" />
        <path d={`M${b.x + 190} ${b.y} Q${b.x + 110} ${y0 - 110} ${b.x + 150} ${y0} Q${b.x + 120} ${y0 + 90} ${b.x + 190} ${b.y + b.h}`} fill="none" stroke={rgba(P.bone, 0.45)} strokeWidth={2} />
        <path d={`M${b.x + b.w - 200} ${b.y} Q${b.x + b.w - 100} ${y0 - 110} ${b.x + b.w - 150} ${y0} Q${b.x + b.w - 120} ${y0 + 80} ${b.x + b.w - 190} ${b.y + b.h}`} fill="none" stroke={rgba(P.bone, 0.45)} strokeWidth={2} />
        {chart && sound.map((s, i) => (
          <text key={i} x={b.x + 230 + s.x * (b.w - 460)} y={b.y + 30 + s.y * (b.h - 60)} fontFamily={FONT.hud} fontSize={13} fill={rgba(P.bone, 0.32)} fontWeight={500}>
            {s.v}
          </text>
        ))}
        {/* the road: double line */}
        <path d={road} stroke={P.bone} strokeOpacity={0.9} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={road} stroke="#26324f" strokeWidth={20} fill="none" strokeLinecap="round" />
        <path d={road} stroke={rgba(P.bone, 0.35)} strokeWidth={1.5} strokeDasharray="10 12" fill="none" />
        {highlight && (() => {
          const a = roadAt(highlight[0]);
          const bb = roadAt(highlight[1]);
          return <ellipse cx={(a.x + bb.x) / 2} cy={(a.y + bb.y) / 2} rx={(bb.x - a.x) / 2 + 30} ry={44} fill="none" stroke={P.amber} strokeWidth={2.5} strokeDasharray="8 8" />;
        })()}
        <path d={groups.ao} fill={P.amber} />
        <path d={groups.ai} fill={P.teal} />
        <path d={groups.so} fill={P.amberHot} />
        <path d={groups.si} fill={P.teal} />
        {/* the sea closing in */}
        <path d={topFill} fill={rgba(P.tealDeep, 0.5)} />
        <path d={botFill} fill={rgba(P.tealDeep, 0.5)} />
        <path d={topLine} fill="none" stroke={P.teal} strokeWidth={2.5} strokeDasharray="22 16" strokeDashoffset={-t * 25} opacity={0.9} />
        <path d={botLine} fill="none" stroke={P.teal} strokeWidth={2.5} strokeDasharray="22 16" strokeDashoffset={t * 25} opacity={0.9} />
      </g>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={6} fill="none" stroke={rgba(P.bone, 0.55)} strokeWidth={2} />
      <rect x={b.x + 8} y={b.y + 8} width={b.w - 16} height={b.h - 16} rx={3} fill="none" stroke={rgba(P.bone, 0.2)} strokeWidth={1} />
      {chart && (
        <g>
          <g transform={`translate(${b.x + b.w - 110},${b.y + 100})`}>
            <circle r={44} fill="none" stroke={rgba(P.bone, 0.5)} strokeWidth={1.5} />
            <path d="M0 -62 L9 0 L0 62 L-9 0Z" fill={rgba(P.bone, 0.55)} />
            <path d="M-62 0 L0 -9 L62 0 L0 9Z" fill={rgba(P.bone, 0.28)} />
            <text y={-70} textAnchor="middle" fontFamily={FONT.accent} fontSize={22} fill={P.bone}>N</text>
          </g>
          <text x={b.x + 28} y={b.y + 50} fontFamily={FONT.accent} fontStyle="italic" fontSize={30} fill={P.bone} opacity={0.85}>The Causeway of Harrow Deep</text>
          <text x={roadAt(0).x - 130} y={roadAt(0).y - 40} fontFamily={FONT.hud} fontWeight={500} fontSize={15} letterSpacing={3} fill={P.amber}>HARROW DEEP</text>
          <text x={roadAt(1).x - 10} y={roadAt(1).y - 40} fontFamily={FONT.hud} fontWeight={500} fontSize={15} letterSpacing={3} fill={P.boneDim}>MAINLAND</text>
        </g>
      )}
    </svg>
  );
};
