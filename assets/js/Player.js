export default class PlayerSprite {
  constructor({ image, position, frames, moving, _ctx }) {
    this.image = image
    this.position = position
    this.frames = frames
    this.moving = moving || false
    this._ctx = _ctx
    this.width = null

    this.playerImage = new Image()
    this.playerImage.src = image
  }

  draw() {
    if (this.moving) {
      this.width = this.frames.val * this.playerImage.width / this.frames.max
    } else {
      this.width = 0
    }

    this._ctx.drawImage(
      this.playerImage,
      this.width,
      0,
      this.playerImage.width / this.frames.max,
      this.playerImage.height,
      this.position.x,
      this.position.y,
      this.playerImage.width / this.frames.max,
      this.playerImage.height 
    )

    if (!this.moving) return
    if (this.frames.max > 1) {
      this.frames.elapsed++
    }
    if (this.frames.elapsed % 10 === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}