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

    const game = this._GameState()
    const keyboardListener = this._CreateKeyboardListener()
    keyboardListener.subscriber(game.movePlayer)

    this._Chat()

    this._frames = {
      max: 4,
      val: 0,
      elapsed: 0
    }

    this._RAF()
  }

  _CreateKeyboardListener() {
    const state = {
      observers: []
    }

    function subscriber(observerFunction) {
      state.observers.push(observerFunction)
    }

    function notifyAll(command) {
      console.log(`Notifying ${state.observers.length} observers`)
      for (const observerFunction of state.observers) {//in returns the index of the array, of returns the value
        observerFunction(command)
      }
    }

    const handleKeydown = (event) => {
      const command = {
        playerId: this._uuid,
        keyPressed: event.key
      }

      notifyAll(command)
    }

    // if (!this._isChatInputActive) this._isPlayerMoving = true
    window.addEventListener('keydown', handleKeydown)

    window.addEventListener('keyup', (e) => {
      this._isPlayerMoving = false
    })

    return {
      subscriber
    }
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
    this._uuid = crypto.randomUUID()
    this._socket.connect()
    this._channel = this._socket.channel("room:lobby", { uuid: this._uuid })
    this._channel.join()
      .receive('ok', resp => { console.log('Joined successfully', resp) })
      .receive('error', resp => { console.log('Unable to join', resp) })
  }

  _GameState() {
    this._channel.on('presence_diff', (diffPayload) => {// isso permite que de forma dinamica, renderizemos os usuários que entraram e sairam da sala. Sem isso, caso um usuário saia, os outros usuários presentes na sala só notarão a ausência do boneco que acabou de sair após dar f5. Ele funciona comparando as listas de presença, caso algo mude, ele sincroniza essas mudanças.
      this._presences = Presence.syncDiff(this._presences, diffPayload)
    })

    this._channel.on('presence_state', (payload) => {
      this._presences = Presence.syncState(this._presences, payload) //payload é o objeto de todos os usuários conectados, o syncState coloca esses objetos na array de presence
    })

    return {
      movePlayer: (command) => {
        const keyPressed = command.keyPressed

        console.log(`key ${keyPressed} pressed`)


        
        console.log(this._presences[this._uuid].metas[0].x)
        this._channel.push('player_position', { keyPressed: keyPressed, x: this._presences[this._uuid].metas[0].x, y: this._presences[this._uuid].metas[0].y, playerImage: this._presences[this._uuid].metas[0].playerImage })
      }
    }
  }

  _RAF() {
    requestAnimationFrame(() => {

      console.log(this._presences[this._uuid])
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