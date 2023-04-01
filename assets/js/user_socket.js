import { Socket } from 'phoenix'
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

let players = []

socket.connect()
let channel = socket.channel("room:lobby", {})
channel.join()
  .receive('ok', resp => { console.log('Joined successfully', resp) })
  .receive('error', resp => { console.log('Unable to join', resp) })

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

channel.push('addPlayer', {uuid: uuid, x: playerPositionX, y: playerPositionY})
channel.on('addPlayer', (payload) => {
  players.push({uuid: payload.uuid, x: payload.x, y: payload.y})
})

//renderize the game
function drawGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const pattern = ctx.createPattern(image, 'repeat')
  ctx.fillStyle = pattern
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  console.log(players)

  Object.values(players).forEach(player => {
    channel.on('playerPosition', (payload) => {
      if (payload.uuid === player.uuid) {
        player.x = payload.x
        player.y = payload.y
      }
    })  

    ctx.drawImage(
      playerImage,
      0,
      0,
      playerImage.width / 4,
      playerImage.height,
      player.x,
      player.y,
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