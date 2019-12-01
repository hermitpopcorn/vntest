import * as Phaser from 'phaser';
import { DialogModalPlugin } from '../plugins/dialog';

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: 'Game',
};

export class SceneOne extends Phaser.Scene {
  private square: Phaser.GameObjects.Rectangle & { body: Phaser.Physics.Arcade.Body };
  private dialogModal: DialogModalPlugin;

  constructor () {
    super(sceneConfig);
  }

  preload ()
  {
    this.plugins.install('DialogModalPlugin', DialogModalPlugin, true, null);
  }

  create () {
    this.square = this.add.rectangle(400, 400, 100, 100, 0xFFFFFF) as any;
    this.physics.add.existing(this.square);

    this.dialogModal = this.plugins.get('DialogModalPlugin') as DialogModalPlugin;
    this.game.events.on('dialogModalClicked', () => {
      if (this.dialogModal.isInAnimation()) {
        this.dialogModal.skipTextAnimation();
      } else {
        this.dialogModal.hideWindow();
      }
    });

    this.dialogModal.setText("Test text.");
  }

  update () {
    const cursorKeys = this.input.keyboard.createCursorKeys();

    if (cursorKeys.up.isDown) {
      this.square.body.setVelocityY(-500);
    } else if (cursorKeys.down.isDown) {
      this.square.body.setVelocityY(500);
    } else {
      this.square.body.setVelocityY(0);
    }

    if (cursorKeys.right.isDown) {
      this.square.body.setVelocityX(500);
    } else if (cursorKeys.left.isDown) {
      this.square.body.setVelocityX(-500);
    } else {
      this.square.body.setVelocityX(0);
    }
  }
}
