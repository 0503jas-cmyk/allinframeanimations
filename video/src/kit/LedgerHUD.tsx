import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, P, easeInOut, hash, rgba, clamp01} from './theme';

export type LedgerHUDProps = {
  out: number;
  in: number;
  night: number;
  /** outstanding (OUT - IN). default out-in. Non-zero renders blood red. */
  delta?: number;
  /** 0..1 glitch strength: slices, channel split, scan bars */
  glitch?: number;
  mode?: 'full' | 'mini' | 'hidden';
  corner?: 'bl' | 'br' | 'tl' | 'tr';
  /** replace the NIGHT readout (e.g. '---' flatline) */
  nightText?: string;
  opacity?: number;
  /** color override for text (desaturated grey at ch7 end) */
  tone?: string;
};

/** Roll a number between from and to, starting at `at` seconds (use inside a component: rollValue(t, 4.0, 0, 1)). */
export const rollValue = (t: number, at: number, from: number, to: number, dur = 0.36) => from + (to - from) * easeInOut((t - at) / dur);

const Digit: React.FC<{v: number; h: number; color: string}> = ({v, h, color}) => {
  // v may be fractional while rolling: floor digit + eased fractional part
  const d = Math.floor(v);
  const f = v - d;
  const pos = d + easeInOut(f);
  return (
    <div style={{width: h * 0.62, height: h, overflow: 'hidden', position: 'relative'}}>
      <div style={{transform: `translateY(${-(pos % 10) * h}px)`, position: 'absolute', left: 0, top: 0, width: '100%'}}>
        {Array.from({length: 11}, (_, i) => (
          <div key={i} style={{height: h, lineHeight: `${h}px`, textAlign: 'center', color, fontFamily: FONT.hud, fontWeight: 700, fontSize: h * 0.86}}>
            {i % 10}
          </div>
        ))}
      </div>
    </div>
  );
};

const Counter: React.FC<{value: number; digits: number; h: number; color: string; comma?: boolean; text?: string}> = ({value, digits, h, color, comma, text}) => {
  if (text) {
    return <div style={{height: h, lineHeight: `${h}px`, color, fontFamily: FONT.hud, fontWeight: 700, fontSize: h * 0.86, letterSpacing: h * 0.06}}>{text}</div>;
  }
  const els: React.ReactNode[] = [];
  for (let i = digits - 1; i >= 0; i--) {
    const p = Math.pow(10, i);
    const base = Math.floor(value / p + 1e-9);
    const remaining = value - base * p;
    const roll = i === 0 ? remaining : Math.max(0, Math.min(1, remaining - (p - 1)));
    els.push(<Digit key={i} v={base + roll} h={h} color={color} />);
    if (comma && i === 3) els.push(<div key="c" style={{width: h * 0.2, height: h, lineHeight: `${h * 1.12}px`, color, fontFamily: FONT.hud, fontWeight: 700, fontSize: h * 0.7, textAlign: 'center'}}>,</div>);
  }
  return <div style={{display: 'flex', alignItems: 'flex-start'}}>{els}</div>;
};

const Card: React.FC<{p: LedgerHUDProps; color: string; frameOffset?: number}> = ({p, color}) => {
  const delta = p.delta ?? p.out - p.in;
  const mini = p.mode === 'mini';
  const h = mini ? 30 : 46;
  const cell = (label: string, node: React.ReactNode, lc = rgba(P.bone, 0.6)) => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0}}>
      <div style={{fontFamily: FONT.hud, fontWeight: 500, fontSize: mini ? 11 : 13, letterSpacing: '0.22em', color: lc}}>{label}</div>
      {node}
    </div>
  );
  const deltaColor = delta !== 0 ? P.blood : color;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: mini ? 8 : 14,
        padding: mini ? '12px 18px' : '18px 24px 20px',
        background: `linear-gradient(180deg, ${rgba(P.ink1, 0.9)}, ${rgba(P.ink0, 0.94)})`,
        border: `1.5px solid ${rgba(P.bone, 0.5)}`,
        borderRadius: 4,
        boxShadow: `0 0 0 5px ${rgba(P.ink0, 0.5)}, inset 0 0 40px ${rgba(P.teal, 0.05)}`,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {!mini && (
        <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.hud, fontWeight: 500, fontSize: 11, letterSpacing: '0.3em', color: rgba(P.bone, 0.45)}}>
          <span>HARROW DEEP</span>
          <span>TIDE LEDGER</span>
        </div>
      )}
      <div style={{display: 'flex', gap: mini ? 22 : 34, alignItems: 'flex-start'}}>
        {cell('OUT', <Counter value={p.out} digits={1} h={h} color={color} />)}
        {cell('IN', <Counter value={p.in} digits={1} h={h} color={color} />)}
        {cell('NIGHT', <Counter value={p.night} digits={5} h={h} color={color} comma text={p.nightText} />)}
        {cell('DELTA', <Counter value={Math.abs(delta)} digits={1} h={h} color={deltaColor} />, delta !== 0 ? rgba(P.blood, 0.9) : rgba(P.bone, 0.6))}
      </div>
    </div>
  );
};

/** Cold mechanical voice of the film: Inter, teal numerals, bone frame, rolling digits. Glitch with slices + channel split + scan bars (no filters). */
export const LedgerHUD: React.FC<LedgerHUDProps> = (props) => {
  const {mode = 'full', corner = 'bl', glitch = 0, opacity = 1, tone} = props;
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (mode === 'hidden') return null;
  const color = tone ?? P.teal;
  const pos: React.CSSProperties = {position: 'absolute', [corner[0] === 'b' ? 'bottom' : 'top']: 56, [corner[1] === 'l' ? 'left' : 'right']: 64};
  const g = clamp01(glitch);
  const seed = Math.floor(frame / 2);
  const bands = g > 0 ? 4 : 0;
  const jitter = (i: number, a: number) => (hash(seed * 3.1 + i * 7.7) - 0.5) * 2 * a * g;
  const H = mode === 'mini' ? 110 : 150;
  void fps;
  return (
    <div style={{...pos, opacity, willChange: 'transform'}}>
      {g === 0 ? (
        <Card p={props} color={color} />
      ) : (
        <div style={{position: 'relative'}}>
          {/* base, split into clipped bands */}
          {Array.from({length: bands}, (_, i) => (
            <div key={i} style={{position: i === 0 ? 'relative' : 'absolute', left: 0, top: 0, transform: `translateX(${jitter(i, 28)}px)`, clipPath: `inset(${(i / bands) * 100}% 0 ${100 - ((i + 1) / bands) * 100}% 0)`}}>
              <Card p={props} color={color} />
            </div>
          ))}
          {/* channel split copies */}
          <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${-4 * g}px)`, opacity: 0.45, mixBlendMode: 'normal', clipPath: `inset(${hash(seed) * 40}% 0 ${hash(seed + 9) * 30}% 0)`}}>
            <Card p={props} color={P.amber} />
          </div>
          {/* scan bars */}
          {Array.from({length: 3}, (_, i) => (
            <div key={'s' + i} style={{position: 'absolute', left: -10, right: -10, top: hash(seed + i * 5) * H, height: 3 + hash(seed + i) * 8, background: rgba(i % 2 ? P.amber : P.teal, 0.3 * g)}} />
          ))}
        </div>
      )}
    </div>
  );
};
