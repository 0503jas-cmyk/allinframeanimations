import React, {useMemo} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P, clamp01, easeInOut, hash, mix, prog} from './theme';
import {glyphFor, polyLen, Pt} from './glyphs';

export type InkKind = 'night' | 'bone' | 'pencil' | 'amber' | 'blood' | 'stone' | 'brown';
const INK: Record<InkKind, {dry: string; wet: string; width: number}> = {
  night: {dry: P.penInk, wet: '#3b4b7e', width: 1},
  bone: {dry: P.bone, wet: P.amberHot, width: 1},
  pencil: {dry: '#6f7688', wet: '#9aa0ae', width: 0.7},
  amber: {dry: P.amber, wet: P.amberHot, width: 1},
  blood: {dry: P.blood, wet: '#e08a73', width: 1},
  stone: {dry: P.boneDim, wet: P.bone, width: 0.9},
  brown: {dry: '#4e3220', wet: '#9a6a3c', width: 1},
};
export const inkColor = (k: InkKind) => INK[k].dry;

export type InkTextProps = {
  mode?: 'stroke' | 'clip';
  text: string;
  /** left (or centre if align='center') and BASELINE y, px in the 1920x1080 frame */
  x: number;
  y: number;
  /** cap height (stroke) or font size (clip), px */
  size?: number;
  /** seconds in the current composition timeline (use timing.cue(id)) */
  start: number;
  end: number;
  ink?: InkKind;
  hand?: 'adult' | 'child';
  align?: 'left' | 'center';
  underline?: boolean;
  strike?: boolean;
  /** drying: colour shifts from wet to dry over this many seconds after writing (0 = off) */
  settle?: number;
  penHead?: boolean;
  /** stroke mode: extra letter spacing in em */
  tracking?: number;
  /** stroke mode: slant in degrees (default -9, leaning right) */
  slant?: number;
  /** stroke mode: nib thickness multiplier */
  weight?: number;
  style?: React.CSSProperties;
};

type Seg = {pts: Pt[]; len: number; c0: number};

/** Self-writing handwriting. stroke: authored pen glyphs (A-Z, 0-9, , . - : ') drawn with pathLength dash; clip: any text, wiped by a soft CSS mask with a travelling nib. */
export const InkText: React.FC<InkTextProps> = ({
  mode = 'stroke',
  text,
  x,
  y,
  size = 80,
  start,
  end,
  ink = 'night',
  hand = 'adult',
  align = 'left',
  underline = false,
  strike = false,
  settle = 0.7,
  penHead = true,
  tracking = 0.1,
  slant = -9,
  weight = 1,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const spec = INK[ink];
  const raw = prog(t, start, end);
  const child = hand === 'child';
  const layout = useMemo(() => {
    const segs: Seg[] = [];
    let cx = 0;
    let c0 = 0;
    const sk = Math.tan((-slant * Math.PI) / 180);
    for (let gi = 0; gi < text.length; gi++) {
      const g = glyphFor(text[gi]);
      if (!g) continue;
      const jr = child ? (hash(gi * 4.1) - 0.5) * 0.28 : 0;
      const jy = child ? (hash(gi * 6.3) - 0.5) * 0.16 : 0;
      const sc = child ? 0.9 + hash(gi * 2.7) * 0.3 : 1;
      for (const st of g.strokes) {
        const pts: Pt[] = st.map(([gx, gy]) => {
          // child: rotate about glyph centre; adult: slant
          let px = gx * sc;
          let py = gy * sc + jy;
          if (child) {
            const ox = px - (g.w * sc) / 2;
            const oy = py - 0.5;
            px = (g.w * sc) / 2 + ox * Math.cos(jr) - oy * Math.sin(jr);
            py = 0.5 + ox * Math.sin(jr) + oy * Math.cos(jr);
          } else px += (1 - py) * sk;
          return [(cx + px) * size, (py - 1) * size] as Pt;
        });
        const len = polyLen(pts);
        segs.push({pts, len, c0});
        c0 += len;
      }
      cx += g.w * sc + tracking * (child ? 1.4 : 1);
    }
    return {segs, total: c0, width: cx * size};
  }, [text, size, slant, tracking, child]);

  if (raw <= 0) return null;
  const sinceDone = Math.max(0, t - end);
  const dry = settle > 0 ? easeInOut(sinceDone / settle) : 1;
  // wet at the nib, dry after
  const color = mix(spec.wet, spec.dry, dry).toString();
  const sz = child ? size * 1.0 : size;

  if (mode === 'clip') {
    const p = easeInOut(raw);
    const soft = Math.max(16, size * 0.5);
    const stop = `calc(${(p * 100).toFixed(2)}% + ${((p - 1) * soft).toFixed(1)}px)`;
    const stop2 = `calc(${(p * 100).toFixed(2)}% + ${(p * soft).toFixed(1)}px)`;
    const mask = `linear-gradient(90deg, #000 ${stop}, transparent ${stop2})`;
    const chars = Array.from(text);
    return (
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y - sz * 0.82,
          transform: align === 'center' ? 'translateX(-50%)' : undefined,
          whiteSpace: 'pre',
          ...style,
        }}
      >
        <div
          style={{
            fontFamily: FONT.hand,
            fontStyle: 'italic',
            fontSize: sz,
            lineHeight: 1.2,
            color,
            WebkitMaskImage: mask,
            maskImage: mask,
            letterSpacing: child ? '0.04em' : undefined,
            fontWeight: child ? 700 : 400,
          }}
        >
          {child
            ? chars.map((c, i) => (
                <span key={i} style={{display: 'inline-block', transform: `translateY(${(hash(i * 3.3) - 0.5) * sz * 0.14}px) rotate(${(hash(i * 7.7) - 0.5) * 9}deg)`}}>
                  {c === ' ' ? ' ' : c}
                </span>
              ))
            : text}
        </div>
        {penHead && raw < 1 && (
          <div
            style={{
              position: 'absolute',
              left: `${p * 100}%`,
              top: sz * 0.55 + Math.sin(frame * 1.7) * 2,
              width: 10,
              height: 10,
              marginLeft: -5,
              borderRadius: 5,
              background: ink === 'bone' || ink === 'amber' ? P.amberHot : P.amber,
              boxShadow: `0 0 12px 3px ${P.amber}`,
            }}
          />
        )}
      </div>
    );
  }

  // ---- stroke mode ----
  const ox = align === 'center' ? x - layout.width / 2 : x;
  const eased = easeInOut(raw);
  const drawn = eased * layout.total;
  const sw = Math.max(1.8, size * 0.06) * weight * spec.width * (child ? 1.5 : 1);
  let head: Pt | null = null;
  const els: React.ReactNode[] = [];
  layout.segs.forEach((s, i) => {
    const lp = clamp01((drawn - s.c0) / Math.max(1e-6, s.len));
    if (lp <= 0) return;
    const d = 'M' + s.pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L');
    els.push(
      <g key={i}>
        <path d={d} pathLength={1} fill="none" stroke={color} strokeOpacity={0.22} strokeWidth={sw * 1.6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${lp} 2`} />
        <path d={d} pathLength={1} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${lp} 2`} />
        {ink === 'pencil' && <path d={d} pathLength={1} fill="none" stroke={color} strokeOpacity={0.4} strokeWidth={sw * 0.6} strokeLinecap="butt" strokeDasharray={`0.02 0.012`} />}
      </g>,
    );
    if (lp < 1) {
      // find head position on this polyline
      let remain = lp * s.len;
      for (let k = 1; k < s.pts.length; k++) {
        const sl = Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1]);
        if (remain <= sl) {
          const u = sl ? remain / sl : 0;
          head = [s.pts[k - 1][0] + (s.pts[k][0] - s.pts[k - 1][0]) * u, s.pts[k - 1][1] + (s.pts[k][1] - s.pts[k - 1][1]) * u];
          break;
        }
        remain -= sl;
      }
    }
  });
  const ul = prog(t, end, end + 0.5);
  const uy = size * (strike ? -0.36 : 0.22);
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none', ...style}}>
      <g transform={`translate(${ox.toFixed(1)} ${y})`}>
        {els}
        {(underline || strike) && ul > 0 && (
          <path
            d={`M${-size * 0.1} ${uy} Q${layout.width * 0.5} ${uy + (strike ? -size * 0.05 : size * 0.06)} ${layout.width + size * 0.1} ${uy + (strike ? size * 0.02 : 0)}`}
            fill="none"
            stroke={strike ? P.blood : color}
            strokeWidth={sw * 1.2}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${easeInOut(ul)} 2`}
          />
        )}
        {penHead && head && <circle cx={(head as Pt)[0]} cy={(head as Pt)[1]} r={Math.max(3.5, size * 0.05)} fill={P.amberHot} opacity={0.95} />}
        {penHead && head && <circle cx={(head as Pt)[0]} cy={(head as Pt)[1]} r={Math.max(10, size * 0.16)} fill={P.amber} opacity={0.25} />}
      </g>
    </svg>
  );
};

export const inkWidth = (text: string, size: number, tracking = 0.1) => {
  let cx = 0;
  for (const ch of text) {
    const g = glyphFor(ch);
    if (g) cx += g.w + tracking;
  }
  return cx * size;
};
