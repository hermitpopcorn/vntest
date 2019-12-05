import * as Phaser from 'phaser';
import { BaseScene } from './base';
import { SceneOne } from './one';
import { DialogModalPlugin } from '../plugins/dialog';

export class SceneTwo extends BaseScene {
  constructor () {
    super('SceneTwo');
  }

  eventSequence () { return [
    'Skip.'
  ]}

  wrapUpScene() {
    super.wrapUpScene();

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        this.scene.add(null, SceneOne, true);
        this.scene.remove(this.key);
      },
      callbackScope: this
    });
  }
}
