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
playerImage.src = '/images/playerDown.png'

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
  channel.push('playerPosition', { id: uuid, x: playerPositionX, y: playerPositionY })
})

//renderize the game
const drawGame = () => {

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const pattern = ctx.createPattern(image, 'repeat');
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  Object.values(players).forEach(player => {
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

  ctx.drawImage(
    playerImage,
    0,
    0,
    playerImage.width / 4,
    playerImage.height,
    playerPositionX,
    playerPositionY,
    playerImage.width / 4,
    playerImage.height
  )
}

function RAF() {
  window.requestAnimationFrame(RAF)
  drawGame()
}
RAF()

channel.push('addUser', {uuid: uuid, x: playerPositionX, y: playerPositionY})

channel.on('addUser', (payload) => {
  players.push({uuid: payload.uuid, x: payload.x, y: payload.y})
})

channel.push('updateUser', {})