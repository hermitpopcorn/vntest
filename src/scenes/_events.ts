export class Wait {
  public length: number;
  constructor (length: number) {
    this.length = length;
  }
}

export class VoicedLine {
  public voiceKey: string;
  public message: string;
  constructor (voiceKey: string, message: string) {
    this.voiceKey = voiceKey;
    this.message = message;
  }
}

export class Autoskip {
  public delay: number;
  constructor (delay?: number) {
    this.delay = delay;
  }
}
