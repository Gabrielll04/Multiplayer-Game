import { Socket, Presence } from 'phoenix'
const socket = new Socket("/socket", { params: {} })
const canvas = document.querySelector('canvas')

const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth / 1.3
canvas.height = window.innerHeight

const uuid = crypto.randomUUID()
let playerPositionX = 0
let playerPositionY = 0

const image = new Image()
image.src = '/images/sprites/grasstest_1.png'

const playerImage = new Image()
playerImage.src = '/images/sprites/playerDown.png'

let presences = []

socket.connect()
let channel = socket.channel("room:lobby", {uuid: uuid})
channel.join()
  .receive('ok', resp => { console.log('Joined successfully', resp) })
  .receive('error', resp => { console.log('Unable to join', resp) })

channel.on('presence_diff', (diffPayload) => {// isso permite que de forma dinamica, renderizemos os usuários que entraram e sairam da sala. Sem isso, caso um usuário saia, os outros usuários presentes na sala só notarão a ausência do boneco que acabou de sair após dar f5. Ele funciona comparando as listas de presença, caso algo mude, ele sincroniza essas mudanças.
  presences = Presence.syncDiff(presences, diffPayload)
})

channel.on('presence_state', (payload) => {
  presences = Presence.syncState(presences, payload) //payload é o objeto de todos os usuários conectados, o syncState coloca esses objetos na array de presence
})

export default socket
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      playerPositionY -= 20
      break
    case 'a':
      playerPositionX -= 20
      break
    case 's':
      playerPositionY += 20
      break
    case 'd':
      playerPositionX += 20
      break
  }
  channel.push('playerPosition', {uuid: uuid, x: playerPositionX, y: playerPositionY})
})

//renderize the game
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const pattern = ctx.createPattern(image, 'repeat')  
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, canvas.width, canvas.height)

console.log(presences)

  Object.values(presences).forEach(player => {
    channel.on('playerPosition', (payload) => {
      if (payload.uuid === player.metas[0].uuid) {
        player.metas[0].x = payload.x
        player.metas[0].y = payload.y
      }
    })  

    ctx.drawImage(
      playerImage,
      0,
      0,
      playerImage.width / 4,
      playerImage.height,
      player.metas[0].x,
      player.metas[0].y,
      playerImage.width / 4,
      playerImage.height
    )
  })
}

function RAF() {
  window.requestAnimationFrame(RAF)
  drawGame()
}
RAF()