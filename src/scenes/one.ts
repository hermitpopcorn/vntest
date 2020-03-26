import * as Phaser from 'phaser';
import { BaseScene } from './_base';
import { SceneTwo } from './two';
import { Wait, VoicedLine, Autoskip } from './_events';

export class SceneOne extends BaseScene {
  constructor () {
    super('SceneOne');
  }

  preload () {
    super.preload();
    this.load.image('nijigaku-clubroom', './assets/images/backgrounds/nsicroom_day.png');
    this.load.image('shioriko-normal', './assets/images/characters/shioriko_n.png');
    this.load.image('shioriko-angry', './assets/images/characters/shioriko_a.png');
    this.load.audio('shioriko-voice-1', './assets/audio/voices/coli-1.mp3');
    this.load.audio('shioriko-voice-2', './assets/audio/voices/coli-2.mp3');
    this.load.audio('shioriko-voice-3', './assets/audio/voices/coli-3.mp3');
    this.load.audio('shioriko-voice-4', './assets/audio/voices/coli-4.mp3');
    this.load.audio('door', './assets/audio/sfx/door.mp3');

    var progressBox = this.add.graphics();
    var progressBar = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect((1920 / 2) - 300, (1080 / 2) - 50, 600, 100);

    this.load.on('progress', function (value) {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(((1920 / 2) - 300) + 10, ((1080 / 2) - 50) + 10, Math.max((600 * value) - 20, 0), 100 - 20);
    });

    this.load.on('complete', function () {
      progressBox.destroy();
      progressBar.destroy();
    });
  }

  create () {
    super.create();
  }

  eventSequence () { var self = this; return [
    () => {
      this.images['background'] = this.add.image(1920 / 2, 1080 / 2, 'nijigaku-clubroom');
      this.images['background'].setAlpha(0);
      this.images['background'].setDepth(1500);
      this.add.tween({
        targets: [this.images['background']],
        duration: 600,
        alpha: { from: 0, to: 1 }
      });
    },
    'Waktu itu, entah mengapa tiba-tiba Mifune masuk ke dalam ruangan.',
    new Wait(400),
    () => {
      this.sounds['door'] = this.sound.add('door');
      this.sounds['door'].play();
    },
    new Wait(400),
    () => {
      this.images['shioriko'] = this.add.image(1920 / 2, 660, 'shioriko-normal');
      this.images['shioriko'].setAlpha(0);
      this.images['shioriko'].setDepth(1501);
      this.add.tween({
        targets: [this.images['shioriko']],
        duration: 600,
        alpha: { from: 0, to: 1 }
      });
    },
    new Wait(1000),
    '[Shioriko]...',
    'Dia diam menatapku tajam.',
    '[Aku]Mifune... ada apa?',
    new Wait(100),
    () => {
      this.images['shioriko'].setTexture('shioriko-angry');
    },
    'Tiba-tiba wajahnya berubah bengis.',
    new VoicedLine('shioriko-voice-1', '[Shioriko]Eh, semuanya.'),
    '[Aku]Ah...?',
    () => {
      this.add.tween({
        targets: [this.images['shioriko']],
        duration: 600,
        scale: { from: 1, to: 1.2 },
      });
    },
    new VoicedLine('shioriko-voice-2', '[Shioriko]Kalau di grup tuh jangan berisik...'),
    '[Aku]Mi, Mifune...?',
    () => {
      this.add.tween({
        targets: [this.images['shioriko']],
        duration: 600,
        scale: { from: 1.2, to: 1.8 },
        y: { from: 660, to: 800 },
      });
    },
    new Autoskip(5000),
    new VoicedLine('shioriko-voice-3', '[Shioriko]Udah tau gue lagi coli lu malah pada berisik ANJING! KONTOL!'),
    new Autoskip(null),
    () => {
      this.add.tween({
        targets: [this.images['shioriko']],
        duration: 2000,
        scale: { from: 1.8, to: 5 },
        y: { from: 800, to: 2000 },
      });
    },
    new Autoskip(2500),
    new VoicedLine('shioriko-voice-4', '[Shioriko]Henpon gue jadi ngeleg nih guE LAGI COLI WOEEEIIIII'),
    new Autoskip(null),
    () => {
      var targets = [];
      for (let item of this.images) {
        targets.push(item);
      }

      this.add.tween({
        targets: [this.images['shioriko'], this.images['background']],
        duration: 1000,
        alpha: { from: 1, to: 0 },
      });
    },
    new Wait(1500),
    () => { this.dialogModal.hide(); },
    new Wait(5000),
  ]}

  wrapUpScene() {
    // Loop for now
    this.runSequence(0);
    return true;

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
