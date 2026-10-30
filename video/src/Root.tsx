import {Composition} from 'remotion';
import {Test, TEST_FRAMES} from './Test';
import {MoneyTest, MONEY_TEST_FRAMES} from './MoneyTest';
import {FPS, H, W} from './theme';
import {KitDemo, KIT_DEMO_FRAMES} from './KitDemo';
import {chapterFrames} from './data/layout';
import {Chapter as Ch1} from './chapters/Ch1';
import {Chapter as Ch2} from './chapters/Ch2';
import {Chapter as Ch3} from './chapters/Ch3';
import {Chapter as Ch4} from './chapters/Ch4';
import {Chapter as Ch5} from './chapters/Ch5';
import {Chapter as Ch6} from './chapters/Ch6';
import {Chapter as Ch7} from './chapters/Ch7';
import {Chapter as Ch8} from './chapters/Ch8';
import {Chapter as Ch9} from './chapters/Ch9';

const CHAPTERS = [Ch1, Ch2, Ch3, Ch4, Ch5, Ch6, Ch7, Ch8, Ch9];

export const Root = () => (
  <>
    <Composition id="Test" component={Test} durationInFrames={TEST_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="MoneyTest" component={MoneyTest} durationInFrames={MONEY_TEST_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="KitDemo" component={KitDemo} durationInFrames={KIT_DEMO_FRAMES} fps={FPS} width={W} height={H} />
    {CHAPTERS.map((C, i) => (
      <Composition key={i + 1} id={`Ch${i + 1}`} component={C} durationInFrames={chapterFrames(i + 1)} fps={FPS} width={W} height={H} />
    ))}
  </>
);
