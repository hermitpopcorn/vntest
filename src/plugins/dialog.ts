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
  private padding;
  private dialogSpeed;
  private eventCounter;
  private position;
  private visible;
  private text;
  private timedEvent;
  private dialog;
  private graphics;
  private animating;

  constructor (pluginManager) {
    super(pluginManager);
    this.scene = pluginManager.game.scene.scenes[0];
  }

  start (): void {
    var eventEmitter = this.game.events;
    eventEmitter.on('shutdown', this.shutdown, this);
    eventEmitter.on('destroy', this.destroy, this);
  }

  alertio () {
    alert("a");
  }

  // Initialize the dialog modal
  init (opts?): void {
    // Check to see if any optional parameters were passed
    if (!opts) opts = {};
    // set properties from opts object or use defaults
    this.borderThickness = opts.borderThickness || 3;
    this.borderColor = opts.borderColor || 0x907748;
    this.borderAlpha = opts.borderAlpha || 1;
    this.windowAlpha = opts.windowAlpha || 0.9;
    this.windowColor = opts.windowColor || 0x303030;
    this.windowHeight = opts.windowHeight || 260;
    this.margin = opts.margin || { out: 48, left: 32, right: 32 };
    this.padding = opts.padding || 24;
    this.dialogSpeed = opts.dialogSpeed || 3;
    this.position = opts.position || 'bottom';

    // used for animating the text
    this.eventCounter = 0;
    // if the dialog window is shown
    this.visible = false;
    // the current text in the window
    this.text;
    // the text that will be displayed in the window
    this.dialog;
    this.graphics;

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

  // Calculates where to place the dialog window based on the game size
  _calculateWindowDimensions (width, height) {
    var x = this.margin.left;
    var y = this.margin.out;
    if (this.position == 'bottom') {
      y = height - this.windowHeight - this.margin.out;
    }
    var rectWidth = width - (this.margin.left + this.margin.right);
    var rectHeight = this.windowHeight;
    return {
      x,
      y,
      rectWidth,
      rectHeight
    };
  }

  // Creates the inner dialog window (where the text is displayed)
  _createInnerWindow (x, y, rectWidth, rectHeight) {
    this.graphics.fillStyle(this.windowColor, this.windowAlpha);
    this.graphics.fillRect(x + 1, y + 1, rectWidth - 1, rectHeight - 1);
  }

  // Creates the border rectangle of the dialog window
  _createOuterWindow (x, y, rectWidth, rectHeight) {
    this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
    console.log([x, y]);
    this.graphics.strokeRect(x, y, rectWidth, rectHeight);
  }

  // Creates the dialog window
  _createWindow () {
    var gameHeight = this._getGameHeight();
    var gameWidth = this._getGameWidth();
    var dimensions = this._calculateWindowDimensions(gameWidth, gameHeight);
    this.graphics = this.scene.add.graphics();
    this.graphics.visible = this.visible;
    this.graphics.setDepth(1000);

    this._createOuterWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
    this._createInnerWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);

    console.log(dimensions);
    var windowBox = this.scene.make.zone({
      x: dimensions.x + (dimensions.rectWidth / 2),
      y: dimensions.y + (dimensions.rectHeight / 2),
      width: dimensions.rectWidth,
      height: dimensions.rectHeight
    });
    windowBox.setInteractive();
    windowBox.on('pointerdown', () => { this.game.events.emit('dialogModalClicked') });
  }

  hideWindow() {
    if (this.visible) this.toggleWindow();
  }

  // Hide/Show the dialog window
  toggleWindow (to?: boolean) {
    if (to === undefined) {
      this.visible = !this.visible;
    } else {
      this.visible = to;
    }

    let targets = []
    if (this.text) targets.push(this.text);
    if (this.graphics) targets.push(this.graphics);

    if (this.visible) {
      targets.map(target => { target.visible = 1 });
    }

    this.scene.add.tween({
      targets,
      duration: 600,
      alpha: (this.visible) ? { from: 0, to: 1 } : { from: 1, to: 0 },
      onComplete: () => { if (!this.visible) targets.map(target => { target.visible = 0 }) }
    });
  }

  // Sets the text for the dialog window
  setText (text, opts?) {
    // Set default options
    if (!opts) opts = {};
    opts.animate = opts.animate || true;

    // Reset the dialog
    this.eventCounter = 0;
    this.dialog = text.split('');
    if (this.timedEvent) this.timedEvent.remove();

    var tempText = opts.animate ? '' : text;
    this._setText(tempText);

    if (opts.animate) {
      this.animating = true;
      this.timedEvent = this.scene.time.addEvent({
        delay: 150 - (this.dialogSpeed * 30),
        callback: this._animateText,
        callbackScope: this,
        loop: true
      });
    } else { this.animating = false; }

    if (!this.visible) this.toggleWindow(true);
  }

  // Slowly displays the text in the window to make it appear annimated
  _animateText () {
    this.eventCounter++;
    this.text.setText(this.text.text + this.dialog[this.eventCounter - 1]);
    if (this.eventCounter === this.dialog.length) {
      this.animating = false;
      this.timedEvent.remove();
    }
  }

  // Calcuate the position of the text in the dialog window
  _setText (text) {
    // Reset the dialog
    if (this.text) this.text.destroy();

    var x = this.margin.left + this.padding;
    var y = this.margin.out + this.padding;
    if (this.position == 'bottom') {
      y = this._getGameHeight() - this.windowHeight - this.margin.out + this.padding;
    }

    this.text = this.scene.make.text({
      x,
      y,
      text,
      style: {
        fontFamily: "Segoe UI",
        fontSize: 40,
        wordWrap: { width: this._getGameWidth() - (this.padding * 2) - 25 },
        fixedHeight: this.windowHeight - this.padding
      }
    });
    this.text.setDepth(1001);
  }

  skipTextAnimation () {
    if (this.timedEvent) this.timedEvent.remove();
    this.text.setText(this.dialog.join(''));
    this.animating = false;
  }

  isInAnimation (): boolean {
    return this.animating;
  }

  update () {}

  //  Called when a Scene shuts down, it may then come back again later
  // (which will invoke the 'start' event) but should be considered dormant.
  shutdown () {
    if (this.timedEvent) this.timedEvent.remove();
    if (this.text) this.text.destroy();
  }

  destroy () {
    this.shutdown();
    this.scene = undefined;
  }
}
