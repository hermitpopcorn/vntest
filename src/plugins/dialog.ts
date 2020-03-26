import * as Phaser from 'phaser';

export class DialogModalPlugin extends Phaser.Plugins.BasePlugin {
  private scene;
  private borderThickness;
  private borderColor;
  private borderAlpha;
  private windowAlpha;
  private windowColor;
  private windowHeight;
  private margin;
  private messageSpeed;
  private eventCounter;
  private visible;
  private text;
  private characterName;
  private characterNameText;
  private timedEvent;
  private message;
  private images;
  private animating;
  private sound;
  private textStyle;
  private drawn;
  private autoclose;

  constructor (pluginManager) {
    super(pluginManager);
  }

  init (opts?) {
    // Check to see if any optional parameters were passed
    if (!opts) opts = {};
    // set properties from opts object or use defaults
    this.borderThickness = opts.borderThickness || 3;
    this.borderColor = opts.borderColor || 0x907748;
    this.borderAlpha = opts.borderAlpha || 1;
    this.windowAlpha = opts.windowAlpha || 0.9;
    this.windowColor = opts.windowColor || 0xffffff;
    this.windowHeight = opts.windowHeight || 300;
    this.margin = opts.margin || { top: 70, left: 350, right: 350 };
    this.messageSpeed = opts.messageSpeed || 10;
    this.sound = opts.sound || null;

    // used for animating the text
    this.eventCounter = 0;
    // if the dialog window is shown
    this.visible = false;
    // the current text in the window
    this.text;
    // the text that will be displayed in the window
    this.message;
    // the images that are used to display the textbox
    this.images = [];
    // show nameplate
    this.characterName = null;
    this.characterNameText;
    // whether images have been drawn (init)
    this.drawn = false;
    // whether the message immediately closes after text animation ends
    this.autoclose = false;

    // text style
    this.textStyle = {
      color: '#2b2b2b',
      fontFamily: "Mukta",
      fontSize: 42
    };

    if (opts.scene) {
      this.scene = opts.scene;
    }
  }

  setScene (scene: Phaser.Scene) {
    this.scene = scene;
  }

  _getNameplateShiftAmount (name): number
  {
    if (name === "Shioriko") {
      return 0.6;
    }
    return 0;
  }

  _processPixel (data, index, deltahue)
  {
      var r = data[index];
      var g = data[index + 1];
      var b = data[index + 2];

      var hsv = Phaser.Display.Color.RGBToHSV(r, g, b);

      var h = hsv.h + deltahue;

      var rgb: any = Phaser.Display.Color.HSVToRGB(h, hsv.s, hsv.v);

      data[index] = rgb.r;
      data[index + 1] = rgb.g;
      data[index + 2] = rgb.b;
  }

  start () {
    // Create the dialog window
    this._createWindow();
  }

  // Gets the width of the game (based on the scene)
  _getGameWidth (): number {
    return Number(this.game.config.width);
  }

  // Gets the height of the game (based on the scene)
  _getGameHeight (): number {
    return Number(this.game.config.height);
  }

  // Lodas the window images
  _loadWindow () {
    this.scene.load.image('messageWindowBack', './assets/images/system/textbox.png');
    this.scene.load.image('nameplateBack', './assets/images/system/nameplate.png');
  }

  // Creates the dialog window
  _createWindow () {
    this._loadWindow();

    var gameHeight = this._getGameHeight();
    var gameWidth = this._getGameWidth();

    var clicked = () => {
      this.game.events.emit('dialogModalClicked'); // Emit event globally because I don't know how to do it better
    };

    var windowBox = this.scene.make.zone({
      x: 0,
      y: 820,
      width: gameWidth,
      height: gameHeight
    });
    windowBox.setOrigin(0, 0);
    windowBox.setInteractive();
    windowBox.on('pointerdown', clicked);

    var keyObj = this.scene.input.keyboard.addKey('ENTER');
    keyObj.on('up', clicked);
  }

  hide () {
    if (this.visible) this.toggleWindow();
  }

  show () {
    if (!this.visible) this.toggleWindow();
  }

  // Hide/Show the dialog window
  toggleWindow (to?: boolean) {
    if (to === undefined) {
      this.visible = !this.visible;
    } else {
      this.visible = to;
    }

    var targets = []
    if (this.text) targets.push(this.text);
    targets.push(this.images['messageWindow']);
    targets.push(this.characterNameText);
    if (this.characterName) {
      targets.push(this.images['nameplate']);
    }

    if (this.visible) {
      targets.map(target => { target.visible = 1 });
    }

    this.scene.add.tween({
      targets,
      duration: 600,
      alpha: (this.visible) ? { from: 0, to: 1 } : { from: 1, to: 0 },
      onComplete: () => {
        if (!this.visible) targets.map(target => { target.visible = 0 });
      }
    });
  }

  _draw () {
    // Initialize images
    this._createWindowBg();
    this._createNameText();
    this._shiftNameplate();
  }

  _createWindowBg () {
    if (!this.images['messageWindow']) {
      // Background
      this.images['messageWindow'] = this.scene.add.image(0, 0, 'messageWindowBack');
      this.images['messageWindow'].setOrigin(0, 0);
      this.images['messageWindow'].setAlpha(0);
      this.images['messageWindow'].setDepth(1800);
    }
  }

  _createNameText () {
    // Initialize character name text
    if (!this.characterNameText) {
      var style = {...this.textStyle, ...{
        wordWrap: { width: 600 },
        fixedHeight: 56,
        shadow: { offsetX: 2, offsetY: 2, color: '#666666', blur: 2, fill: true }
      }};
      this.characterNameText = this.scene.make.text({ x: 290, y: 778,
        text: this.characterName || "",
        style
      });
      this.characterNameText.setDepth(1802);
    }
  }

  _resetNameplate () {
    // If have been initialized, destroy
    if (this.images['nameplate']) {
      this.images['nameplateTexture'] = null;
      this.images['shiftedNameplateTexture'].destroy();
      this.images['shiftedNameplateContext'] = null;
      this.images['nameplate'].destroy();
    }
    this.images['nameplateTexture'] = this.scene.textures.get('nameplateBack').getSourceImage();
    this.images['shiftedNameplateTexture'] = this.scene.textures.createCanvas('shiftedTextNameplateBg', this.images['nameplateTexture'].width, this.images['nameplateTexture'].height);
    this.images['shiftedNameplateContext'] = this.images['shiftedNameplateTexture'].getSourceImage().getContext('2d');
    this.images['shiftedNameplateContext'].drawImage(this.images['nameplateTexture'], 0, 0);
    this.images['nameplate'] = this.scene.add.image(197, 770, 'shiftedTextNameplateBg');
    this.images['nameplate'].setOrigin(0, 0);
    this.images['nameplate'].setAlpha(0);
    this.images['nameplate'].setDepth(1801);
    this.images['shiftedNameplateTexture'].refresh();
  }

  _shiftNameplate () {
    this._resetNameplate();

    if (this.characterName) {
      this.characterNameText.setText(this.characterName);
      this.characterNameText.setAlpha(1);
      this.images['nameplate'].setAlpha(1);

      var pixels = this.images['shiftedNameplateContext'].getImageData(0, 0, this.images['nameplateTexture'].width, this.images['nameplateTexture'].height);
      for (var i = 0; i < pixels.data.length / 4; i++)
      {
        this._processPixel(pixels.data, i * 4, this._getNameplateShiftAmount(this.characterName));
      }
      this.images['shiftedNameplateContext'].putImageData(pixels, 0, 0);
      this.images['shiftedNameplateTexture'].refresh();
    } else {
      this.characterNameText.setAlpha(0);
      this.images['nameplate'].setAlpha(0);
    }
  }

  // Sets the text for the dialog window
  setText (text, name?, opts?) {
    if (!this.drawn) {
      this.drawn = true;
      this._draw();
    }

    // Set default options
    if (!opts) opts = {};
    opts.animate = opts.animate || true;
    opts.append = opts.append || false;
    opts.autoclose = opts.autoclose || false;

    // Autoclose setting
    this.autoclose = opts.autoclose;

    // Reset the dialog text
    if (this.characterNameText) this.characterNameText.setText('');
    if (this.text) this.text.setText('');
    this.eventCounter = 0;
    this.message = text.split('');
    if (this.timedEvent) this.timedEvent.remove();

    // Display nameplate if requested
    this.characterName = name || false;
    // Change nameplate color
    this._shiftNameplate();

    // Process text
    var tempText: string;
    if (opts.append) {
      tempText = opts.animate ? this.text.text : this.text.text + text;
    } else {
      tempText = opts.animate ? '' : text;
    }
    this._setText(tempText);

    if (opts.animate) {
      this.animating = true;
      this.timedEvent = this.scene.time.addEvent({
        delay: 150 - (this.messageSpeed * 30),
        callback: this._animateText,
        callbackScope: this,
        loop: true
      });
    } else { this.animating = false; this._finish(); }

    // If not visible yet, force visibility
    if (!this.visible) this.toggleWindow(true);
  }

  // Slowly displays the text in the window to make it appear annimated
  _animateText () {
    this.eventCounter++;
    this.text.setText(this.text.text + this.message[this.eventCounter - 1]);
    if (this.eventCounter === this.message.length) {
      // Finished animating
      this.animating = false;
      this.timedEvent.remove();
      this._finish();
    }
  }

  // Calcuate the position of the text in the dialog window
  _setText (text) {
    // Reset the dialog
    if (this.text) this.text.destroy();

    var x = this.margin.left;
    var y = this._getGameHeight() - this.windowHeight + this.margin.top;

    this.text = this.scene.make.text({
      x,
      y,
      text,
      style: {...this.textStyle, ...{
        wordWrap: { width: this._getGameWidth() - (this.margin.left + this.margin.right) },
        fixedHeight: this.windowHeight,
        shadow: { offsetX: 2, offsetY: 2, color: '#666666', blur: 2, fill: true }
      }}
    });
    this.text.setDepth(1803);
  }

  // Finish up displaying text
  _finish () {
    if (this.autoclose) {
      this.game.events.emit('autoNext');
    }
  }

  skipTextAnimation () {
    if (this.timedEvent) this.timedEvent.remove();
    this.text.setText(this.message.join(''));
    this.animating = false;
    this._finish();
  }

  isInAnimation (): boolean {
    return this.animating;
  }

  isAutoclose (): boolean {
    return this.autoclose;
  }

  update () {}

  //  Called when a Scene shuts down, it may then come back again later
  // (which will invoke the 'start' event) but should be considered dormant.
  shutdown () {
    if (this.timedEvent) this.timedEvent.remove();
    if (this.text) this.text.destroy();
    if (this.characterNameText) this.characterNameText.destroy();
    if (this.images['shiftedNameplateTexture']) this.images['shiftedNameplateTexture'].destroy();
    if (this.images['nameplate']) this.images['nameplate'].destroy();
    if (this.images['messageWindow']) this.images['messageWindow'].destroy();
  }

  destroy () {
    this.shutdown();
  }
}
