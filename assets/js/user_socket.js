import { Socket, Presence } from 'phoenix'
import PlayerSprite from './Player'

class Game {
  constructor() {
    this._Initialize()
  }

  _Initialize() {
    this._socket = new Socket("/socket", { params: {} })
    this._canvas = document.querySelector('canvas')
    this._ctx = this._canvas.getContext('2d')

    this._canvas.width = window.innerWidth / 1.3
    this._canvas.height = window.innerHeight

    this._image = new Image()
    this._image.src = '/images/sprites/grasstest_1.png'
  
    this._uuid = crypto.randomUUID()
    let playerPositionX = 0
    let playerPositionY = 0
    const sprites = {
      playerDown: '/images/sprites/playerDown.png',
      playerUp: '/images/sprites/playerUp.png',
      playerLeft: '/images/sprites/playerLeft.png',
      playerRight: '/images/sprites/playerRight.png'
    }

    this._presences = []
    this._isPlayerMoving = false
    this._isChatInputActive = false

    this._playerImage = new Image()

    this._Connection()
    this._Chat()

    window.addEventListener('keydown', (e) => {
      if (!this._isChatInputActive) this._isPlayerMoving = true
      switch (e.key) {
        case 'w':
          if (this._isChatInputActive) return
          else {
            playerPositionY -= 10
            this._playerImage.src = sprites.playerUp
          }
          break
        case 'a':
          if (this._isChatInputActive) return
          else {
            playerPositionX -= 10
            this._playerImage.src = sprites.playerLeft
          }
          break
        case 's':
          if (this._isChatInputActive) return
          else {
            playerPositionY += 10
            this._playerImage.src = sprites.playerDown
          }
          break
        case 'd':
          if (this._isChatInputActive) return
          else {
            playerPositionX += 10
            this._playerImage.src = sprites.playerRight
          }
          break
      }
      this._channel.push('player_position', { x: playerPositionX, y: playerPositionY, playerImage: this._playerImage.src })
    })

    window.addEventListener('keyup', (e) => {
      this._isPlayerMoving = false
    })

    this._frames = {
      max: 4,
      val: 0,
      elapsed: 0
    }

    this._RAF()
  }

  _Chat() {
    const chatInput = document.querySelector('#chat-input')
    const chatArea = document.querySelector('#chat-area')

    chatInput.addEventListener('keypress', (event) => {
      this._isChatInputActive = true
      if (event.key == 'Enter') {
        this._channel.push('new_msg', { uuid: this._uuid, msg: chatInput.value })
        chatInput.value = ""
        this._isChatInputActive = false
        chatInput.blur()
      }
    })

    this._channel.on('new_msg', (payload) => {
      const messageItem = document.createElement('p')
      messageItem.innerText = `${payload.uuid}: ${payload.msg}`
      chatArea.appendChild(messageItem)
      this._isChatInputActive = false
    })
  }

  _Connection() {
    this._socket.connect()
    this._channel = this._socket.channel("room:lobby", { uuid: this._uuid })
    this._channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) })

    this._channel.on('presence_diff', (diffPayload) => {// isso permite que de forma dinamica, renderizemos os usuários que entraram e sairam da sala. Sem isso, caso um usuário saia, os outros usuários presentes na sala só notarão a ausência do boneco que acabou de sair após dar f5. Ele funciona comparando as listas de presença, caso algo mude, ele sincroniza essas mudanças.
      this._presences = Presence.syncDiff(this._presences, diffPayload)
    })

    this._channel.on('presence_state', (payload) => {
      this._presences = Presence.syncState(this._presences, payload) //payload é o objeto de todos os usuários conectados, o syncState coloca esses objetos na array de presence
    })
  }

  _RAF() {
    requestAnimationFrame(() => {

      this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height)

      const pattern = this._ctx.createPattern(this._image, 'repeat')
      this._ctx.fillStyle = pattern
      this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height)
      Object.values(this._presences).forEach(player => {
        this._playerImage.src = player.metas[0].playerImage

        this._player = new PlayerSprite({
          image: this._playerImage,
          position: {
            x: player.metas[0].x,
            y: player.metas[0].y,
          },
          frames: this._frames,
          moving: this._isPlayerMoving,
          _ctx: this._ctx,
        })
        this._player.draw()
      })
      this._RAF()
    })
  }
}


let _APP = new Game()
export default _APP._socket