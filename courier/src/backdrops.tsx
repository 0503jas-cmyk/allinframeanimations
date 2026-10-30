import React from 'react';
import {C, rnd, W, H} from './theme';
import {Sky, Stars, Skyline, Road, Fog, Lamp, Hill, Grid} from './bg';

type P = {t: number; scroll: number; p?: any};

const Sun: React.FC<{x: number; y: number; r: number; col?: string}> = ({x, y, r, col = '#ffd27a'}) => (
  <g><circle cx={x} cy={y} r={r * 2.2} fill={col} opacity={0.12} /><circle cx={x} cy={y} r={r * 1.4} fill={col} opacity={0.2} /><circle cx={x} cy={y} r={r} fill={col} /></g>
);

const Crates: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g transform={`translate(${x} ${y})`}><rect width={90} height={70} fill="#6b4a2a" stroke="#3a2614" strokeWidth={4} /><rect x={10} y={10} width={70} height={50} fill="none" stroke="#3a2614" strokeWidth={3} /></g>
);

const WreckedCar: React.FC<{x: number; y: number; col: string; s?: number}> = ({x, y, col, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-120} y={-50} width={240} height={50} rx={14} fill={col} />
    <path d="M-70 -50 L-40 -100 L50 -100 L80 -50Z" fill={col} />
    <path d="M-52 -54 L-34 -92 L-4 -92 L-4 -54Z M8 -54 L8 -92 L44 -92 L68 -54Z" fill="#1a2234" />
    <circle cx={-70} cy={0} r={22} fill="#111" /><circle cx={72} cy={0} r={22} fill="#111" />
    <path d="M-120 -30 l30 -10" stroke="#00000055" strokeWidth={6} />
  </g>
);

export const Backdrop: React.FC<{name: string} & P> = ({name, t, scroll, p}) => {
  switch (name) {
    case 'dawnCity':
      return (
        <g>
          <Sky top="#2a3a66" bottom="#f0a070" h={760} />
          <Sun x={1380} y={470} r={90} />
          <Skyline scroll={scroll * 0.12} base={720} color="#5a5f86" seed={3} hMin={200} hMax={480} lit={0.05} />
          <Skyline scroll={scroll * 0.3} base={780} color="#2c3156" seed={9} hMin={160} hMax={400} lit={0.08} />
          <Road scroll={scroll} y={770} h={320} color="#1c2038" />
          <WreckedCar x={((1900 - scroll * 0.9) % 2800 + 2800) % 2800 - 400} y={800} col="#7a3a3a" />
          <WreckedCar x={((900 - scroll * 0.9) % 2800 + 2800) % 2800 - 400} y={790} col="#3a5a7a" s={0.9} />
        </g>
      );
    case 'nightHwy':
      return (
        <g>
          <Sky top="#060a1a" bottom="#1c2a52" h={760} />
          <Stars t={t} />
          <circle cx={1500} cy={190} r={64} fill="#f0f0d8" opacity={0.9} />
          <Skyline scroll={scroll * 0.1} base={720} color="#121a36" seed={5} lit={0.12} hMin={220} hMax={520} />
          <Skyline scroll={scroll * 0.25} base={780} color="#0d1430" seed={12} lit={0.16} hMin={140} hMax={360} />
          <Road scroll={scroll} y={770} h={320} color="#10142a" />
          <rect x={0} y={760} width={W} height={14} fill="#2a3150" />
        </g>
      );
    case 'roof':
      return (
        <g>
          <Sky top="#2a3a66" bottom="#f4b08a" h={760} />
          <Sun x={1500} y={420} r={80} />
          <Skyline scroll={t * 6} base={700} color="#4a4f7a" seed={21} hMin={240} hMax={500} lit={0.04} />
          <rect x={0} y={760} width={W} height={400} fill="#3a3550" />
          <rect x={0} y={750} width={W} height={20} fill="#4a4563" />
          {[200, 560, 1300].map((x, i) => <g key={i}><rect x={x} y={690} width={160} height={70} rx={8} fill="#6b4a2a" />{[0, 1, 2, 3].map((k) => <circle key={k} cx={x + 20 + k * 40} cy={680 - (k % 2) * 12} r={22} fill="#4a9a4a" />)}</g>)}
          <rect x={1700} y={0} width={14} height={720} fill="#2a2f3a" />
        </g>
      );
    case 'pharmacy':
      return (
        <g>
          <rect width={W} height={H} fill="#1b2a38" />
          <rect y={760} width={W} height={400} fill="#0f1822" />
          {[0, 1, 2].map((r) => <g key={r}><rect x={80} y={160 + r * 190} width={1000} height={14} fill="#4a5a6a" />{Array.from({length: 16}).map((_, i) => <rect key={i} x={96 + i * 62} y={110 + r * 190 + rnd(i + r * 17) * 10} width={44} height={50 - rnd(i + r) * 10} fill={['#5a9aa0', '#c0645a', '#d6b25a', '#8a7ab0'][Math.floor(rnd(i * 3 + r) * 4)]} />)}</g>)}
          <rect x={1180} y={560} width={720} height={40} fill="#6a5a46" />
          <rect x={1180} y={600} width={720} height={200} fill="#4a3d30" />
          <rect x={1300} y={80} width={420} height={70} rx={10} fill="#0a1218" /><text x={1510} y={128} textAnchor="middle" fontSize={44} fontWeight={900} fill="#e0483e" fontFamily="Inter" opacity={0.6 + 0.4 * Math.sin(t * 7)}>PHARMACY</text>
          <Lamp x={1500} y={300} r={420} col="#7fffd4" op={0.18} />
        </g>
      );
    case 'mall':
      return (
        <g>
          <rect width={W} height={H} fill="#16122e" />
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${i * 420 - 100} 700 L${i * 420 - 100} 260 Q${i * 420 + 110} 140 ${i * 420 + 320} 260 L${i * 420 + 320} 700Z`} fill="#1f1a40" stroke="#2f2a60" strokeWidth={6} />)}
          {[['#ff4fa3', 'SHOES'], ['#4fd1ff', 'TOYS'], ['#ffd34f', 'CAFE']].map((s, i) => <text key={i} x={320 + i * 640} y={310 + (i % 2) * 40} textAnchor="middle" fontSize={64} fontWeight={900} fill={s[0]} fontFamily="Inter" opacity={0.55 + 0.35 * Math.sin(t * 5 + i * 2)}>{s[1]}</text>)}
          <rect y={720} width={W} height={400} fill="#241d4a" />
          <Grid y0={730} color="#2f2860" />
          <ellipse cx={960} cy={840} rx={300} ry={64} fill="#2f2860" /><ellipse cx={960} cy={830} rx={260} ry={46} fill="#14304a" />
          <rect x={940} y={700} width={40} height={130} fill="#3a3070" />
        </g>
      );
    case 'tunnel':
      return (
        <g>
          <rect width={W} height={H} fill="#090c16" />
          <path d="M0 1080 L0 220 Q960 -140 1920 220 L1920 1080Z" fill="#141a2e" />
          <path d="M120 1080 L120 300 Q960 0 1800 300 L1800 1080Z" fill="#0e1322" />
          {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={120 + i * 40} y1={300} x2={120 + i * 40} y2={1000} stroke="#1a2038" strokeWidth={8} />)}
          <rect x={0} y={800} width={W} height={300} fill="#0a0d18" />
          <rect x={0} y={90} width={W} height={26} fill="#2a3150" opacity={0.7} />
          <Lamp x={960} y={760} r={560} col="#ffb347" op={0.35 + 0.05 * Math.sin(t * 9)} />
        </g>
      );
    case 'yard':
      return (
        <g>
          <Sky top="#1a2040" bottom="#7a4a5a" h={760} />
          <Hill y={700} color="#242a48" seed={14} />
          {[0, 1, 2, 3].map((i) => <g key={i}><rect x={i * 520 - ((scroll * 0.2) % 520) - 60} y={500} width={470} height={240} rx={10} fill={['#6a3a2a', '#3a4a5a', '#5a4a2a', '#4a2a3a'][i]} /><rect x={i * 520 - ((scroll * 0.2) % 520) - 60} y={560} width={470} height={14} fill="#00000044" /></g>)}
          <rect y={740} width={W} height={400} fill="#1a1d2e" />
          {Array.from({length: 24}).map((_, i) => <rect key={i} x={i * 90 - ((scroll * 0.8) % 90) - 40} y={800 + (i % 2) * 6} width={50} height={12} fill="#3a2a22" />)}
          <rect y={812} width={W} height={8} fill="#7a8394" /><rect y={846} width={W} height={8} fill="#7a8394" />
          <Fog y={700} t={t} op={0.3} />
        </g>
      );
    case 'bridge':
      return (
        <g>
          <Sky top="#050816" bottom="#1d2850" h={760} />
          <Stars t={t} n={50} />
          <Skyline scroll={scroll * 0.1} base={740} color="#0f1630" seed={31} lit={0.1} />
          <rect y={880} width={W} height={300} fill="#0a2038" />
          {Array.from({length: 10}).map((_, i) => <rect key={i} x={i * 220 - ((t * 60) % 220)} y={930 + (i % 3) * 36} width={140} height={5} fill="#3a6a9a" opacity={0.4} />)}
          <Road scroll={scroll} y={760} h={130} color="#10142a" />
          {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 400 - ((scroll * 0.9) % 400)} y={660} width={14} height={110} fill="#2a3150" />)}
        </g>
      );
    case 'overpass':
      return (
        <g>
          <Sky top="#2a2f5a" bottom="#f0a47a" h={760} />
          <Sun x={1650} y={560} r={70} />
          <Skyline scroll={t * 4} base={740} color="#3b3f6a" seed={44} hMin={200} hMax={420} lit={0.05} />
          <rect y={740} width={W} height={400} fill="#1a1d36" />
          <rect y={730} width={W} height={20} fill="#3a3f66" />
          {Array.from({length: 7}).map((_, i) => <rect key={i} x={i * 300 + 30} y={600} width={10} height={140} fill="#2a2f50" />)}
        </g>
      );
    case 'haven':
      return (
        <g>
          <Sky top="#4a6ab0" bottom="#ffd9a0" h={800} />
          <Sun x={400} y={480} r={90} col="#fff1c0" />
          <Hill y={760} color="#8a9ac8" seed={50} />
          <rect x={620} y={160} width={680} height={700} fill="#e6eaf2" /><rect x={620} y={160} width={680} height={40} fill="#c8d0e0" />
          {[0, 1, 2, 3, 4, 5, 6].map((r) => [0, 1, 2, 3].map((c) => <rect key={`${r}${c}`} x={660 + c * 160} y={230 + r * 84} width={90} height={50} fill={rnd(r * 9 + c) < 0.5 ? '#ffd27a' : '#6a7aa8'} />))}
          <rect x={0} y={640} width={W} height={260} fill="#dfe4ee" /><rect x={0} y={630} width={W} height={20} fill="#b8c0d6" />
          <rect x={780} y={560} width={360} height={340} fill="#6a7aa8" /><rect x={780} y={560} width={360} height={34} fill="#4a5a88" />
          <rect y={900} width={W} height={200} fill="#5a6a4a" />
          <rect y={880} width={W} height={60} fill="#7a7a82" />
        </g>
      );
    case 'havenIn':
      return (
        <g>
          <rect width={W} height={H} fill="#dfe8f2" />
          <rect y={820} width={W} height={300} fill="#b8c6d8" />
          {Array.from({length: 6}).map((_, i) => <rect key={i} x={i * 330 + 40} y={160} width={230} height={420} rx={12} fill="#b6d4ee" stroke="#8aa8c8" strokeWidth={6} />)}
          <rect y={150} width={W} height={20} fill="#f5f9ff" />
          <Lamp x={960} y={120} r={900} col="#ffffff" op={0.5} />
        </g>
      );
    case 'sunriseWin':
      return (
        <g>
          <rect width={W} height={H} fill="#d8dfec" />
          <rect x={360} y={120} width={1200} height={640} rx={12} fill="#9fc4e8" stroke="#8aa0c0" strokeWidth={22} />
          <Sky top="#4a6ab0" bottom="#ffd9a0" h={0} />
          <rect x={372} y={132} width={1176} height={616} fill="#ffd9a0" />
          <Sun x={960} y={640} r={110} col="#fff1c0" />
          <Hill y={700} color="#8a9ac8" seed={61} />
          <rect x={950} y={120} width={20} height={640} fill="#8aa0c0" /><rect x={360} y={420} width={1200} height={20} fill="#8aa0c0" />
          <rect y={800} width={W} height={300} fill="#b8c6d8" />
        </g>
      );
    case 'night':
      return (<g><Sky top="#060a1a" bottom="#1c2a52" /><Stars t={t} /><rect y={760} width={W} height={400} fill="#0c1128" /></g>);
    case 'storybook':
      return (<g><rect width={W} height={H} fill="#e9d9b2" /><rect x={60} y={60} width={W - 120} height={H - 120} fill="none" stroke="#b69a62" strokeWidth={10} rx={16} /><Sun x={1500} y={260} r={70} col="#f2b84b" /><rect x={80} y={760} width={W - 160} height={240} fill="#cdb98a" /></g>);
    case 'black':
    default:
      return <rect width={W} height={H} fill="#03050a" />;
  }
};
