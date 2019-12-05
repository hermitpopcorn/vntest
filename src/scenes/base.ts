import * as Phaser from 'phaser';
import { DialogModalPlugin } from '../plugins/dialog';

export class BaseScene extends Phaser.Scene {
  protected key: string;
  protected dialogModal: DialogModalPlugin;

  constructor (key: string) {
    super({
      active: false,
      visible: false,
      key: key
    });
    this.key = key;
  }

  preload () {
    this.plugins.install('DialogModalPlugin', DialogModalPlugin, false, 'dialogModal', { scene: this });
  }

  create () {
    var self = this;
    this.dialogModal = this.plugins.get('DialogModalPlugin') as DialogModalPlugin;
    self.game.events.on('dialogModalClicked', () => { self.advance() });

    self.runSequence(0);
  }

  update () {
    // This should be overridden by the child class
  }

  runSequence (index) {
    var self = this;

    self.runEvent(self.eventSequence()[index])
    .then(() => {
      if (index == self.eventSequence().length - 1) {
        // Done, wrap up scene
        self.wrapUpScene();
      } else {
        // Continue to next event in sequence
        self.runSequence(index + 1);
      }
    });
  }

  runEvent (event: any): Promise<any> {
    if (typeof event == "string") {
      return this.runTextDisplay(event);
    } else
    if (typeof event == "object") {
      if (event.constructor.name == "Promise") {
        return event;
      } else
      if (event.constructor.name == "Wait") {
        return this.wait(event.length);
      }
    }
  }

  runTextDisplay (text): Promise<any> {
    var self = this;

    return new Promise((fulfill, reject) => {
      self.dialogModal.setText(text);
      this.game.events.on('advance', () => {
        fulfill();
      })
    });
  }

  wait (length): Promise<any> {
    var self = this;

    return new Promise((fulfill, reject) => {
      return this.time.addEvent({
        delay: length,
        callback: () => { fulfill(); }
      });
    });
  }

  advance () {
    if (this.dialogModal.isInAnimation()) {
      this.dialogModal.skipTextAnimation();
    } else {
      this.game.events.emit('advance');
    }
  }

  eventSequence () { return [
    // This should be overridden by the child class
  ]}

  wrapUpScene () {
    this.dialogModal.hideWindow();
    this.plugins.removeGlobalPlugin('DialogModalPlugin');
  }
}
