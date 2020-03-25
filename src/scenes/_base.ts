import * as Phaser from 'phaser';
import { DialogModalPlugin } from '../plugins/dialog';
import { Wait } from './_events';

export class BaseScene extends Phaser.Scene {
  protected key: string;
  protected dialogModal: DialogModalPlugin;

  // Used to store stuff
  protected sounds: Array<Phaser.Sound.BaseSound> = [];
  protected images: Array<Phaser.GameObjects.Image> = [];
  protected timeEvents: Array<Phaser.Time.TimerEvent> = [];

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
    self.dialogModal = self.plugins.get('DialogModalPlugin') as DialogModalPlugin;
    self._initEvents();

    self.runSequence(0);
  }

  _initEvents () {
    var self = this;
    self.game.events.on('dialogModalClicked', () => { self.advance() });
    self.game.events.on('autoNext', () => { self.advance() });
  }

  update () {
    // This should be overridden by the child class
  }

  playCharacterVoice (key) {
    var self = this;

    if (self.sounds['voice']) {
      self.sounds['voice'].stop();
      self.sounds['voice'].destroy();
    }
    self.sounds['voice'] = self.sound.add(key);
    self.sounds['voice'].play();
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
    var self = this;

    if (typeof event == "string") {
      return self.runTextDisplay(event);
    } else
    if (typeof event == "object") {
      if (event instanceof Promise) {
        return event;
      } else
      if (event instanceof Wait) {
        return self.wait(event.length);
      }
    } else
    if (typeof event == "function") {
      return new Promise((fulfill, reject) => { event(); fulfill(); });
    }
  }

  runTextDisplay (text): Promise<any> {
    var self = this;

    return new Promise((fulfill, reject) => {
      var name = null;
      var opts = {};

      if (text.charAt(0) == "+") {
        opts['append'] = true;
        text = text.substr(1);
      }

      if (text.charAt(0) == "[") {
        var nameEnd = text.indexOf("]");
        name = text.substr(1, nameEnd - 1);
        text = text.substr(nameEnd + 1);
      }

      if (text.charAt(text.length - 1) == "^") {
        opts['autoclose'] = true;
        text = text.substr(0, text.length - 1);
      }

      self.dialogModal.setText(text, name, opts);

      self.game.events.on('nextSequence', () => {
        fulfill();
      })
    });
  }

  wait (length): Promise<any> {
    var self = this;

    return new Promise((fulfill, reject) => {
      return self.time.addEvent({
        delay: length,
        callback: () => { fulfill(); }
      });
    });
  }

  advance () {
    var self = this;

    if (self.dialogModal.isInAnimation() && !self.dialogModal.isAutoclose()) {
      self.dialogModal.skipTextAnimation();
    } else {
      self.game.events.emit('nextSequence');
    }
  }

  eventSequence () { return [
    // This should be overridden by the child class
  ]}

  _removeDialogModal() {
    this.dialogModal.hide();
    this.plugins.removeGlobalPlugin('DialogModalPlugin');
  }

  wrapUpScene () {
    // Stop all sounds
    for (let sound of this.sounds) {
      sound.stop();
      sound.destroy();
    }

    // Remove Dialog Modal
    this._removeDialogModal();
  }
}
