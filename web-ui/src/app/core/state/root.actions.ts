export class SendImage {
  static readonly type = '[Root] send image'
  constructor(public file: File) {
  }
}
export class SetEmbedded {
  static readonly type = '[Root] set embedded'
  constructor(public isEmbedded: boolean) {
  }
}
export class Logout {
  static readonly type = '[Root] logout'
  constructor() {
  }
}
