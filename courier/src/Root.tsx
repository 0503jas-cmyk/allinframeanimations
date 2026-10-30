import React from 'react';
import {Composition} from 'remotion';
import timeline from './timeline.json';
import {Scene, sceneFrames} from './Scene';
import {CharTest} from './CharTest';
export const Root: React.FC = () => (
  <>
    <Composition id="CharTest" component={CharTest} durationInFrames={60} fps={30} width={1920} height={1080} />
    {timeline.map((s: any) => (
      <Composition key={s.id} id={s.id.toUpperCase()} component={Scene} defaultProps={{id: s.id}} durationInFrames={sceneFrames(s.id)} fps={30} width={1920} height={1080} />
    ))}
  </>
);
