import * as Phaser from 'phaser';
import { DialogModalPlugin } from './plugins/dialog';
import { SceneOne } from './scenes/one';
import { SceneTwo } from './scenes/two';

const gameConfig: Phaser.Types.Core.GameConfig = {
  title: 'Sample',

  type: Phaser.AUTO,

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1920,
    height: 1080,
  },

  physics: {
    default: 'arcade',
    arcade: {
      debug: true,
    },
  },

  parent: 'game',
  backgroundColor: '#000000',

  scene: SceneOne
};

export const game = new Phaser.Game(gameConfig);
