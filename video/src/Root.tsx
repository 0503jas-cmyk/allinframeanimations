import {Composition} from 'remotion';
import {Test, TEST_FRAMES} from './Test';
import {FPS, H, W} from './theme';

export const Root = () => (
  <>
    <Composition id="Test" component={Test} durationInFrames={TEST_FRAMES} fps={FPS} width={W} height={H} />
  </>
);
