export default class PlayerSprite {
  constructor({ image, position, frames, moving, _ctx }) {
    this.image = image
    this.position = position
    this.frames = frames
    this.moving = moving
    this._ctx = _ctx
  }

  draw() {
    this._ctx.drawImage(
      this.image,
      this.frames.val * this.image.width / this.frames.max,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height 
    )

    if (!this.moving) return
    if (this.frames.max > 1) {
      this.frames.elapsed++
    }
    if (this.frames.elapsed % 15 === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}