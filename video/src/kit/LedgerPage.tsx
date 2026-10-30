import React from 'react';
import {staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P, clamp01, prog, rgba, hash} from './theme';
import {InkText, InkKind} from './InkText';

export type LedgerRow = {
  date: string;
  out?: string[];
  in?: string[];
  ink?: 'ink' | 'pencil' | 'child';
  /** seconds when this row starts being written */
  writeAt: number;
  writeDur?: number;
  /** ghost row: appears from nothing (fade) rather than being written */
  ghost?: boolean;
  /** blood-red OUT entry marker (the unmatched one) */
  flag?: boolean;
};

export type LedgerPageProps = {
  rows: LedgerRow[];
  /** top-left position, px (page 1180x820 at scale 1) */
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  width?: number;
  height?: number;
  /** warm lamp position in page-local px; omit for none */
  lamp?: {x: number; y: number};
  torn?: boolean;
  /** child's page: bigger, wobblier letters */
  child?: boolean;
  title?: string;
  /** fade-in of page 0..1 */
  opacity?: number;
};

const INK_MAP: Record<NonNullable<LedgerRow['ink']>, InkKind> = {ink: 'night', pencil: 'pencil', child: 'night'};
const ROW_H = 74;

/** Bone ledger page in its own coordinate space (baked paper jpg, ruled lines, margin, DATE/OUT/IN columns). Rows self-write. */
export const LedgerPage: React.FC<LedgerPageProps> = ({rows, x = 360, y = 130, scale = 1, rotate = 0, width = 1200, height = 820, lamp, torn = false, child = false, title = 'TIDE LEDGER · HARROW DEEP', opacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const dateW = 210;
  const colW = (width - 90 - dateW - 40) / 2;
  const top = 150;
  const jag = torn
    ? `polygon(0 0, 100% 0, 100% 8%, 98% 14%, 100% 22%, 97% 31%, 99% 40%, 96% 50%, 99% 58%, 97% 68%, 100% 78%, 98% 88%, 100% 100%, 0 100%)`
    : undefined;
  return (
    <div style={{position: 'absolute', left: x, top: y, width, height, transform: `rotate(${rotate}deg) scale(${scale})`, transformOrigin: '0 0', opacity, willChange: 'transform'}}>
      <div style={{position: 'absolute', inset: 0, clipPath: jag, boxShadow: undefined}}>
        <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('kit/paper.jpg')})`, backgroundSize: '100% 100%'}} />
        {/* ruled lines */}
        <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
          {Array.from({length: Math.floor((height - top - 40) / ROW_H) + 1}, (_, i) => (
            <path key={i} d={`M40 ${top + i * ROW_H}H${width - 40}`} stroke={rgba(P.boneDim, 0.55)} strokeWidth={1.4} />
          ))}
          <path d={`M${40 + dateW} 70V${height - 30}`} stroke={rgba(P.blood, 0.45)} strokeWidth={2} />
          <path d={`M${44 + dateW} 70V${height - 30}`} stroke={rgba(P.blood, 0.25)} strokeWidth={1} />
          <path d={`M${40 + dateW + 40 + colW} 70V${height - 30}`} stroke={rgba(P.boneDim, 0.6)} strokeWidth={1.4} />
          <path d={`M40 112H${width - 40}`} stroke={rgba(P.penInk, 0.6)} strokeWidth={2.4} />
        </svg>
        <div style={{position: 'absolute', left: 44, top: 22, fontFamily: FONT.title, fontSize: 17, letterSpacing: '0.2em', color: rgba(P.penInk, 0.7)}}>{title}</div>
        {[['DATE', 44], ['OUT', 40 + dateW + 28], ['IN', 40 + dateW + 40 + colW + 28]].map(([l, lx]) => (
          <div key={l as string} style={{position: 'absolute', left: lx as number, top: 76, fontFamily: FONT.title, fontSize: 18, letterSpacing: '0.25em', color: P.penInk, opacity: 0.85}}>
            {l}
          </div>
        ))}
        {rows.map((r, i) => {
          const rowY = top + i * ROW_H;
          const dur = r.writeDur ?? 1.6;
          const kind: InkKind = INK_MAP[r.ink ?? 'ink'];
          const rowChild = child || r.ink === 'child';
          const fs = rowChild ? 40 : 34;
          const base = rowY + ROW_H - 22;
          if (t < r.writeAt - 0.02) return null;
          const ghostA = r.ghost ? clamp01(prog(t, r.writeAt, r.writeAt + 1.2)) : 1;
          const cols: [string[] | undefined, number, number][] = [[r.out, 40 + dateW + 28, 0.35], [r.in, 40 + dateW + 40 + colW + 28, 0.62]];
          return (
            <div key={i} style={{opacity: ghostA}}>
              <InkText mode="clip" text={r.date} x={52} y={base} size={fs * 0.8} start={r.ghost ? -99 : r.writeAt} end={r.ghost ? -98 : r.writeAt + dur * 0.35} ink={kind === 'pencil' ? 'night' : kind} penHead={false} hand={rowChild ? 'child' : 'adult'} />
              {cols.map(([vals, cx, a], k) =>
                (vals ?? []).map((v, j) => (
                  <InkText
                    key={k + '-' + j}
                    mode="clip"
                    text={v}
                    x={cx + j * 120}
                    y={base}
                    size={fs}
                    start={r.ghost ? -99 : r.writeAt + dur * a}
                    end={r.ghost ? -98 : r.writeAt + dur * (a + 0.3)}
                    ink={r.flag && k === 0 ? 'blood' : kind}
                    hand={rowChild ? 'child' : 'adult'}
                    penHead={false}
                  />
                )),
              )}
            </div>
          );
        })}
        {/* curled corner + edge shading */}
        <div style={{position: 'absolute', right: 0, bottom: 0, width: 90, height: 90, background: `linear-gradient(135deg, rgba(0,0,0,0) 50%, ${rgba(P.boneDim, 0.55)} 51%, ${P.boneShade} 100%)`}} />
        <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 90px ${rgba('#6b5a3a', 0.45)}`, pointerEvents: 'none'}} />
        {lamp && (
          <div
            style={{
              position: 'absolute',
              left: lamp.x - 520,
              top: lamp.y - 520,
              width: 1040,
              height: 1040,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${rgba(P.amberHot, 0.55)} 0%, ${rgba(P.amber, 0.25)} 30%, ${rgba(P.amberDeep, 0.08)} 58%, rgba(0,0,0,0) 72%)`,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};
export const _h = hash;
