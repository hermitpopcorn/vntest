import * as Phaser from 'phaser';
import { BaseScene } from './_base';
import { SceneTwo } from './two';
import { Wait } from './_events';

export class SceneOne extends BaseScene {
  private sounds: any = {};

  constructor () {
    super('SceneOne');
  }

  preload () {
    super.preload();
    this.load.audio('garden-of-eden', 'assets/audio/garden-of-eden.mp3');
  }

  create () {
    super.create();
  }

  eventSequence () { var self = this; return [
    'First text.',
    () => { this.sounds.bgm = self.sound.add('garden-of-eden'); this.sounds.bgm.play(); },
    'Second text.',
    () => { this.cameras.main.flash(); },
    '+ Third text. Now wait for three seconds.',
    new Wait(3000),
    'Fourth text.'
  ]}

  wrapUpScene() {
    super.wrapUpScene();
    this.sounds.bgm.stop();
    this.sounds.bgm.destroy();

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
