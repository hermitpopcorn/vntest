import * as Phaser from 'phaser';
import { BaseScene } from './base';
import { SceneTwo } from './two';
import { Wait } from './_events';

export class SceneOne extends BaseScene {
  constructor () {
    super('SceneOne');
  }

  eventSequence () { return [
    'First text.',
    'Second text.',
    'Third text. Now wait for three seconds.',
    new Wait(3000),
    'Fourth text.'
  ]}

  wrapUpScene() {
    super.wrapUpScene();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.add(null, SceneTwo, true);
        this.scene.remove(this.key);
      },
      callbackScope: this
    });
  }
}
