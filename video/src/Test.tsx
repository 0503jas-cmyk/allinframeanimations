import type React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FPS, MONO, SANS, makeTimeline} from './theme';

const VO_START = 1.0;
const VO_DUR = 20.5;
export const TEST_FRAMES = 25 * FPS;

const SENTENCES = [
  'Right now, you are pressing a key.',
  "Maybe you didn't even notice.",
  'But in the next few milliseconds, that tiny movement will become electricity, then a number, then a decision made by your operating system, and finally a glowing letter on this screen.',
  'This is the journey of a single keypress.',
];
const SCRIPT = SENTENCES.join(' ');
const TL = makeTimeline(SCRIPT, VO_START, VO_DUR);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);

const useSec = () => {
  const f = useCurrentFrame();
  return f / FPS;
};

const Background = () => {
  const f = useCurrentFrame();
  const off = (f * 0.4) % 80;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, ${C.bg2} 0%, ${C.bg} 70%)`}}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${C.grid} 1px, transparent 1px), linear-gradient(90deg, ${C.grid} 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          backgroundPosition: `${off}px ${off}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const ROWS = ['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
const KEY = 76;
const GAP = 12;

const Keyboard = ({pressAt}: {pressAt: number}) => {
  const t = useSec();
  const {fps} = useVideoConfig();
  const appear = interpolate(t, [0.4, 1.6], [0, 1], {...clamp, easing: ease});
  const press = spring({frame: (t - pressAt) * fps, fps, config: {damping: 14, stiffness: 220}, durationInFrames: 20});
  const down = t >= pressAt ? Math.min(1, press) : 0;
  const release = interpolate(t, [pressAt + 0.5, pressAt + 0.9], [1, 0], {...clamp});
  const depth = down * release;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: GAP, opacity: appear, transform: `translateY(${(1 - appear) * 40}px)`}}>
      {ROWS.map((row, r) => (
        <div key={row} style={{display: 'flex', gap: GAP, marginLeft: r * 38}}>
          {[...row].map((ch) => {
            const hot = ch === 'K';
            return (
              <div
                key={ch}
                style={{
                  width: KEY,
                  height: KEY,
                  borderRadius: 14,
                  background: hot ? `linear-gradient(180deg, ${C.cyan}, #2dd4bf)` : '#18213d',
                  color: hot ? '#05231f' : C.dim,
                  border: `2px solid ${hot ? C.cyan : '#26325a'}`,
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 30,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transform: hot ? `translateY(${depth * 10}px) scale(${1 - depth * 0.06})` : undefined,
                  boxShadow: hot ? `0 ${8 - depth * 6}px 0 #14867a, 0 0 ${30 + depth * 50}px rgba(94,234,212,${0.35 + depth * 0.5})` : '0 8px 0 #0e1530',
                }}
              >
                {ch}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

type Stage = {label: string; sub: string; color: string; at: number; render: (p: number) => React.ReactElement};

const Wave = ({p}: {p: number}) => {
  const f = useCurrentFrame();
  const pts: string[] = [];
  for (let x = 0; x <= 140; x += 4) {
    const y = 30 + Math.sin((x + f * 6) / 9) * 18 * Math.min(1, p * 2);
    pts.push(`${x},${y}`);
  }
  return (
    <svg width="160" height="60" viewBox="0 0 160 60">
      <polyline points={pts.join(' ')} fill="none" stroke={C.amber} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
};

const Bits = ({p}: {p: number}) => {
  const f = useCurrentFrame();
  const bits = '01001011';
  return (
    <div style={{fontFamily: MONO, fontSize: 44, letterSpacing: 6, color: C.cyan, fontWeight: 700}}>
      {[...bits].map((b, i) => (
        <span key={i} style={{opacity: p > i / 9 ? 1 : 0.15}}>{p < 1 && (f + i * 3) % 14 < 4 ? (b === '1' ? '0' : '1') : b}</span>
      ))}
    </div>
  );
};

const Decision = ({p}: {p: number}) => (
  <svg width="160" height="110" viewBox="0 0 160 110">
    <rect x="20" y="10" width="120" height="90" rx="16" fill="none" stroke={C.violet} strokeWidth="5" />
    {[0, 1, 2].map((i) => (
      <rect key={i} x="38" y={26 + i * 24} width={interpolate(p, [i * 0.2, i * 0.2 + 0.4], [0, 84 - i * 14], clamp)} height="10" rx="5" fill={C.violet} />
    ))}
  </svg>
);

const Letter = ({p}: {p: number}) => (
  <div style={{fontFamily: SANS, fontWeight: 900, fontSize: 110, lineHeight: 1, color: C.text, textShadow: `0 0 ${20 + p * 50}px ${C.pink}, 0 0 ${60 * p}px ${C.pink}`, opacity: p}}>K</div>
);

const Chain = ({stages}: {stages: Stage[]}) => {
  const t = useSec();
  const n = stages.length;
  const x0 = 260;
  const x1 = 1660;
  const y = 700;
  const xs = stages.map((_, i) => x0 + ((x1 - x0) * i) / (n - 1));
  const last = stages[n - 1].at;
  const lineOn = interpolate(t, [stages[0].at - 0.3, last], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const lineEnd = x0 + (x1 - x0) * lineOn;
  return (
    <AbsoluteFill>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <line x1={x0} x2={x1} y1={y} y2={y} stroke="#1f2a4d" strokeWidth="6" strokeLinecap="round" opacity={interpolate(t, [stages[0].at - 0.6, stages[0].at - 0.2], [0, 1], clamp)} />
        <line x1={x0} x2={lineEnd} y1={y} y2={y} stroke={C.cyan} strokeWidth="6" strokeLinecap="round" />
        <circle cx={lineEnd} cy={y} r="11" fill={C.cyan} opacity={lineOn > 0 && lineOn < 1 ? 1 : 0} style={{filter: `drop-shadow(0 0 14px ${C.cyan})`}} />
      </svg>
      {stages.map((s, i) => {
        const p = interpolate(t, [s.at, s.at + 0.9], [0, 1], {...clamp, easing: ease});
        return (
          <div key={s.label} style={{position: 'absolute', left: xs[i] - 170, top: y - 250, width: 340, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p, transform: `translateY(${(1 - p) * 30}px)`}}>
            {s.render(p)}
          </div>
        );
      })}
      {stages.map((s, i) => {
        const p = interpolate(t, [s.at, s.at + 0.6], [0, 1], {...clamp, easing: ease});
        return (
          <div key={s.label + 'l'} style={{position: 'absolute', left: xs[i] - 170, top: y + 36, width: 340, textAlign: 'center', fontFamily: SANS, opacity: p}}>
            <div style={{width: 22, height: 22, borderRadius: 11, background: s.color, margin: '-58px auto 22px', boxShadow: `0 0 ${24 * p}px ${s.color}`}} />
            <div style={{color: C.text, fontWeight: 800, fontSize: 38}}>{s.label}</div>
            <div style={{color: C.dim, fontWeight: 500, fontSize: 24, marginTop: 6}}>{s.sub}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const Captions = () => {
  const t = useSec();
  const cues = SENTENCES.map((s) => {
    const start = TL.at(s);
    const end = TL.end(s);
    return {s, start, end};
  });
  const cue = cues.find((c) => t >= c.start - 0.05 && t < c.end + 0.25);
  if (!cue) return null;
  const a = interpolate(t, [cue.start - 0.05, cue.start + 0.2, cue.end, cue.end + 0.25], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 200, right: 200, bottom: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, lineHeight: 1.35, color: C.text, opacity: a, textShadow: '0 2px 18px rgba(0,0,0,0.9)'}}>
      {cue.s}
    </div>
  );
};

const Title = ({at}: {at: number}) => {
  const t = useSec();
  const words = ['THE', 'JOURNEY', 'OF', 'A', 'SINGLE', 'KEYPRESS'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '0 34px', justifyContent: 'center', maxWidth: 1500, fontFamily: SANS, fontWeight: 900, fontSize: 120, letterSpacing: 4}}>
        {words.map((w, i) => {
          const p = interpolate(t, [at + i * 0.12, at + i * 0.12 + 0.7], [0, 1], {...clamp, easing: ease});
          const accent = w === 'KEYPRESS';
          return (
            <span key={w} style={{opacity: p, transform: `translateY(${(1 - p) * 60}px)`, color: accent ? C.cyan : C.text, textShadow: accent ? `0 0 40px ${C.cyan}` : undefined, display: 'inline-block'}}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Test = () => {
  const t = useSec();
  const pressAt = TL.at('Right now') + 1.4;
  const stages: Stage[] = [
    {label: 'Electricity', sub: 'a closed circuit', color: C.amber, at: TL.at('electricity') - 0.3, render: (p) => <Wave p={p} />},
    {label: 'A number', sub: 'scan code', color: C.cyan, at: TL.at('a number') - 0.3, render: (p) => <Bits p={p} />},
    {label: 'A decision', sub: 'operating system', color: C.violet, at: TL.at('a decision') - 0.3, render: (p) => <Decision p={p} />},
    {label: 'A letter', sub: 'pixels on screen', color: C.pink, at: TL.at('a glowing') - 0.3, render: (p) => <Letter p={p} />},
  ];
  const titleAt = TL.at('This is the journey') - 0.2;
  const sceneOut = interpolate(t, [titleAt - 0.7, titleAt], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: C.bg}}>
      <Background />
      <AbsoluteFill style={{opacity: sceneOut}}>
        <Keyboard pressAt={pressAt} />
        <Chain stages={stages} />
      </AbsoluteFill>
      <Title at={titleAt} />
      <Captions />
      <Sequence from={Math.round(VO_START * FPS)}>
        <Audio src={staticFile('test-vo.mp3')} />
      </Sequence>
    </AbsoluteFill>
  );
};
