import React from 'react';
import {AbsoluteFill, staticFile} from 'remotion';
import {C, W, H, FONT_BOLD, FONT_MONO, clamp, easeOut, rnd} from './theme';

export type LineItem = {type: 'line'; id: string; who: string; text: string; start: number; end: number};

/** Kinetic caption: 2-3 word chunks over the line, longest word gold */
export const Kinetic: React.FC<{line: LineItem; t: number}> = ({line, t}) => {
  const words = line.text.replace(/[“”"]/g, '').split(/\s+/);
  const chunks: string[][] = [];
  for (let i = 0; i < words.length; ) { const n = words.length - i <= 3 ? words.length - i : (words[i].length + words[i + 1].length > 12 ? 2 : 3); chunks.push(words.slice(i, i + n)); i += n; }
  const dur = line.end - line.start, per = dur / chunks.length;
  const local = t - line.start;
  const ci = Math.min(chunks.length - 1, Math.floor(local / per));
  const c = chunks[ci];
  const cu = (local - ci * per) / per;
  const sc = 0.85 + 0.15 * easeOut(clamp(cu * 6));
  const longest = c.reduce((b, w, i) => (w.replace(/\W/g, '').length > c[b].replace(/\W/g, '').length ? i : b), 0);
  const size = c.join(' ').length > 22 ? 104 : 126;
  return (
    <div style={{position: 'absolute', left: 0, width: W, bottom: 150, textAlign: 'center', transform: `scale(${sc})`, fontFamily: FONT_BOLD, fontWeight: 900, fontSize: size, letterSpacing: -2, textTransform: 'uppercase', lineHeight: 1, textShadow: '0 8px 0 #000a, 0 0 30px #000c', WebkitTextStroke: '3px #00000066'}}>
      {c.map((w, i) => <span key={i} style={{color: i === longest ? C.gold : C.white, marginRight: 24}}>{w}</span>)}
    </div>
  );
};

/** Black-box typed subtitle, top-left */
export const SubBox: React.FC<{line: LineItem; t: number}> = ({line, t}) => {
  const chars = Math.floor(clamp((t - line.start) / Math.max(0.5, (line.end - line.start) * 0.85)) * line.text.length);
  const txt = line.text.slice(0, Math.max(1, chars));
  const nameCol = line.who === 'JUNO' ? '#ff8a6a' : line.who === 'BOLT' ? C.yellow : line.who === 'CRANE' ? '#c9ccd6' : '#7fe0c8';
  return (
    <div style={{position: 'absolute', left: 90, top: 96, maxWidth: 1100, fontFamily: FONT_MONO, fontSize: 40, lineHeight: 1.35, color: '#fff'}}>
      <div style={{display: 'inline-block', background: '#000', padding: '4px 14px'}}>
        <span style={{color: nameCol, fontWeight: 700}}>{line.who === 'ADA' ? 'ADA (radio)' : line.who[0] + line.who.slice(1).toLowerCase()}: </span>{txt}
      </div>
    </div>
  );
};

export const Pill: React.FC<{text: string; t: number}> = ({text, t}) => {
  const a = easeOut(clamp(t / 0.5)) * (1 - clamp((t - 5) / 0.6));
  if (a <= 0) return null;
  return (
    <div style={{position: 'absolute', top: 40, left: 0, width: W, display: 'flex', justifyContent: 'center', opacity: a, transform: `translateY(${(1 - a) * -30}px)`}}>
      <div style={{border: `3px solid ${C.gold}`, background: '#0b1226ee', borderRadius: 22, padding: '10px 34px', fontFamily: FONT_BOLD, fontWeight: 900, fontSize: 40, color: C.white, letterSpacing: 1}}>
        {text.split('|').map((p, i) => <span key={i} style={{color: i === 0 ? C.gold : C.white, marginRight: 18}}>{p}</span>)}
      </div>
    </div>
  );
};

export const Finish: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 55%, #000a 100%)'}} />
    <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile('grain.png')})`, opacity: 0.07, mixBlendMode: 'overlay'}} />
  </AbsoluteFill>
);
