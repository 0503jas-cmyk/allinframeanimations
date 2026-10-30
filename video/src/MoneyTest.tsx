import {AbsoluteFill, Audio, Easing, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FPS, SANS, makeTimeline} from './theme';

const VO_START = 1.0;
const VO_DUR = 23.04;
export const MONEY_TEST_FRAMES = 27 * FPS;

const GOLD = '#f5c542';
const SENTENCES = [
  'Ten thousand years ago, nobody had money.',
  'If you wanted bread, you traded for it.',
  'Then someone realized that trade has a problem: you need to find a person who wants exactly what you have.',
  'The solution to that problem would reshape every empire, every war, and every life on Earth.',
  'This is the history of money.',
];
const SCRIPT = SENTENCES.join(' ');
const TL = makeTimeline(SCRIPT, VO_START, VO_DUR);

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const EMOJI = "'Noto Color Emoji', sans-serif";

const useSec = () => useCurrentFrame() / FPS;

const Background = () => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 35%, #1b1630 0%, #0a0812 75%)`}} />
);

const Era = ({from, to}: {from: number; to: number}) => {
  const t = useSec();
  const p = interpolate(t, [from, to], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const year = Math.round(interpolate(p, [0, 1], [2026, -8000]));
  const label = year >= 0 ? `${year} CE` : `${Math.abs(year)} BCE`;
  const a = interpolate(t, [from - 0.2, from + 0.3, to + 1.2, to + 1.8], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 150, color: GOLD, letterSpacing: 4, opacity: a, textShadow: `0 0 50px rgba(245,197,66,0.45)`}}>
      {label}
    </div>
  );
};

const Person = ({x, y, emoji, wants, at, tint}: {x: number; y: number; emoji: string; wants: string; at: number; tint: string}) => {
  const t = useSec();
  const p = interpolate(t, [at, at + 0.7], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: x - 150, top: y - 130, width: 300, textAlign: 'center', fontFamily: SANS, opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>
      <div style={{width: 150, height: 150, margin: '0 auto', borderRadius: 75, background: `${tint}22`, border: `3px solid ${tint}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 78, fontFamily: EMOJI}}>
        {emoji}
      </div>
      <div style={{marginTop: 18, color: C.dim, fontSize: 24, fontWeight: 600}}>HAS</div>
      <div style={{color: C.text, fontSize: 36, fontWeight: 800}}>{wants}</div>
    </div>
  );
};

const Want = ({x, y, text, at}: {x: number; y: number; text: string; at: number}) => {
  const t = useSec();
  const p = interpolate(t, [at, at + 0.5], [0, 1], {...clamp, easing: ease});
  return (
    <div style={{position: 'absolute', left: x - 150, top: y + 130, width: 300, textAlign: 'center', fontFamily: SANS, opacity: p, color: '#fda4af', fontWeight: 700, fontSize: 28}}>
      wants {text}
    </div>
  );
};

const Swap = ({at}: {at: number}) => {
  const t = useSec();
  const p = interpolate(t, [at, at + 1.0], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const fade = interpolate(t, [at + 3.6, at + 4.2], [1, 0], clamp);
  return (
    <div style={{opacity: fade}}>
      <div style={{position: 'absolute', left: 560 + 560 * p, top: 470, fontSize: 70, fontFamily: EMOJI, opacity: p > 0 && p < 1 ? 1 : 0}}>🌾</div>
      <div style={{position: 'absolute', left: 1360 - 560 * p, top: 540, fontSize: 70, fontFamily: EMOJI, opacity: p > 0 && p < 1 ? 1 : 0}}>🐟</div>
    </div>
  );
};

const Problem = ({at, solveAt}: {at: number; solveAt: number}) => {
  const t = useSec();
  const cross = interpolate(t, [at + 0.3, at + 0.9], [0, 1], {...clamp, easing: ease});
  const crossOut = interpolate(t, [solveAt, solveAt + 0.5], [1, 0], clamp);
  const coin = spring({frame: (t - solveAt) * FPS, fps: FPS, config: {damping: 12, stiffness: 120}});
  const coinOn = t >= solveAt ? Math.min(1.1, coin) : 0;
  const spin = Math.cos((t - solveAt) * 3.2);
  return (
    <>
      <svg width="1920" height="1080" style={{position: 'absolute', inset: 0}}>
        <line x1="760" x2="1160" y1="560" y2="560" stroke="#3a3560" strokeWidth="6" strokeDasharray="14 14" />
        <g opacity={cross * crossOut}>
          <line x1="920" y1="520" x2="1000" y2="600" stroke="#fb7185" strokeWidth="14" strokeLinecap="round" />
          <line x1="1000" y1="520" x2="920" y2="600" stroke="#fb7185" strokeWidth="14" strokeLinecap="round" />
        </g>
        <g opacity={coinOn > 0 ? 1 : 0}>
          <line x1="760" x2="1160" y1="560" y2="560" stroke={GOLD} strokeWidth="8" />
        </g>
      </svg>
      <div style={{position: 'absolute', left: 960 - 70, top: 560 - 70, width: 140, height: 140, borderRadius: 70, background: `radial-gradient(circle at 35% 30%, #ffe28a, ${GOLD} 55%, #b8860b)`, boxShadow: `0 0 ${60 * coinOn}px rgba(245,197,66,0.8)`, transform: `scale(${coinOn}) scaleX(${Math.abs(spin) * 0.7 + 0.3})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: SANS, fontWeight: 900, fontSize: 64, color: '#7a5600'}}>
        $
      </div>
    </>
  );
};

const Title = ({at}: {at: number}) => {
  const t = useSec();
  const words = ['THE', 'HISTORY', 'OF', 'MONEY'];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', gap: 40, fontFamily: SANS, fontWeight: 900, fontSize: 150, letterSpacing: 4}}>
        {words.map((w, i) => {
          const p = interpolate(t, [at + i * 0.15, at + i * 0.15 + 0.7], [0, 1], {...clamp, easing: ease});
          const hot = w === 'MONEY';
          return (
            <span key={w} style={{opacity: p, transform: `translateY(${(1 - p) * 70}px)`, color: hot ? GOLD : C.text, textShadow: hot ? `0 0 50px ${GOLD}` : undefined}}>
              {w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const Captions = () => {
  const t = useSec();
  const cue = SENTENCES.map((s) => ({s, start: TL.at(s), end: TL.end(s)})).find((c) => t >= c.start - 0.05 && t < c.end + 0.25);
  if (!cue) return null;
  const a = interpolate(t, [cue.start - 0.05, cue.start + 0.2, cue.end, cue.end + 0.25], [0, 1, 1, 0], clamp);
  return (
    <div style={{position: 'absolute', left: 200, right: 200, bottom: 70, textAlign: 'center', fontFamily: SANS, fontWeight: 600, fontSize: 34, lineHeight: 1.35, color: C.text, opacity: a, textShadow: '0 2px 18px rgba(0,0,0,0.9)'}}>
      {cue.s}
    </div>
  );
};

export const MoneyTest = () => {
  const t = useSec();
  const s1 = TL.at(SENTENCES[0]);
  const s2 = TL.at(SENTENCES[1]);
  const s3 = TL.at(SENTENCES[2]);
  const s4 = TL.at(SENTENCES[3]);
  const s5 = TL.at(SENTENCES[4]);
  const sceneOut = interpolate(t, [s5 - 0.7, s5 - 0.1], [1, 0], clamp);
  const eraOut = interpolate(t, [s2 - 0.3, s2 + 0.2], [1, 0], clamp);
  return (
    <AbsoluteFill style={{background: '#0a0812'}}>
      <Background />
      <AbsoluteFill style={{opacity: eraOut}}>
        <Era from={s1 + 0.3} to={s1 + 2.6} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: sceneOut}}>
        <Person x={560} y={450} emoji="🧑‍🌾" wants="WHEAT" at={s2 + 0.1} tint="#fbbf24" />
        <Person x={1360} y={450} emoji="🎣" wants="FISH" at={s2 + 0.5} tint="#38bdf8" />
        <Swap at={s2 + 1.3} />
        <Want x={560} y={450} text="SALT" at={s3 + 0.3} />
        <Want x={1360} y={450} text="POTS" at={s3 + 0.9} />
        {t >= s2 + 1.0 ? <Problem at={s3} solveAt={s4 + 0.3} /> : null}
      </AbsoluteFill>
      <Title at={s5 + 0.1} />
      <Captions />
      <Sequence from={Math.round(VO_START * FPS)}>
        <Audio src={staticFile('money-vo.mp3')} />
      </Sequence>
    </AbsoluteFill>
  );
};
