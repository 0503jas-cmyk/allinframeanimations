import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import timeline from './timeline.json';
import env from './env.json';
import {Stage, Shot, Talk} from './Stage';
import {Kinetic, SubBox, Pill, Finish, LineItem} from './Overlay';
import {PLANS, PILLS} from './plans';
import {FPS} from './theme';

export const sceneIndex = (id: string) => timeline.findIndex((s: any) => s.id === id);
export const sceneFrames = (id: string) => { const s: any = timeline[sceneIndex(id)]; return Math.round((s.end - s.start) * FPS); };

export const Scene: React.FC<{id: string}> = ({id}) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const sc: any = timeline[sceneIndex(id)];
  const dur = sc.end - sc.start;
  const plan: Shot[] = PLANS[id];
  let si = 0;
  for (let i = 0; i < plan.length; i++) if (t >= plan[i].at) si = i;
  const shot = plan[si];
  const shotEnd = si + 1 < plan.length ? plan[si + 1].at : dur;
  const lines: LineItem[] = sc.items.filter((x: any) => x.type === 'line').map((x: any) => ({...x, start: x.start - sc.start, end: x.end - sc.start}));
  const cur = lines.find((l) => t >= l.start - 0.05 && t <= l.end + 0.15) || null;
  let talk: Talk = {who: null, amp: 0};
  if (cur) {
    const e = (env as any)[(sc.items.find((x: any) => x.id === cur.id)).file.replace('.mp3', '')] as number[];
    const src = (sc.items.find((x: any) => x.id === cur.id)).src_start;
    const k = Math.round((t - cur.start + src) * 30);
    talk = {who: cur.who, amp: e && k >= 0 && k < e.length ? e[k] : 0};
  }
  const fadeIn = Math.min(1, t / 0.4), fadeOut = Math.min(1, (dur - t) / 0.4);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, opacity: Math.min(fadeIn, fadeOut)}}>
        <Stage shot={shot} t={t - shot.at} dur={shotEnd - shot.at} sceneT={t} talk={talk} />
        {PILLS[id] && <Pill text={PILLS[id]} t={t - 0.4} />}
        {cur && <SubBox line={cur} t={t} />}
        {cur && <Kinetic line={cur} t={t} />}
        <Finish />
      </div>
    </AbsoluteFill>
  );
};
