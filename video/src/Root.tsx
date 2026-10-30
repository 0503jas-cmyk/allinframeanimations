import {Composition} from 'remotion';
import {Test, TEST_FRAMES} from './Test';
import {MoneyTest, MONEY_TEST_FRAMES} from './MoneyTest';
import {FPS, H, W} from './theme';
import {KitDemo, KIT_DEMO_FRAMES} from './KitDemo';

export const Root = () => (
  <>
    <Composition id="Test" component={Test} durationInFrames={TEST_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="MoneyTest" component={MoneyTest} durationInFrames={MONEY_TEST_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="KitDemo" component={KitDemo} durationInFrames={KIT_DEMO_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
