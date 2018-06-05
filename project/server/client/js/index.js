'use strict'

// TODO: A;adir toda la logica de inicio de sesion


const app = new PIXI.Application({
  width: 1700,
  height: 800,
  transparent: true,
  antialias: true
})

const controls = {
  up: false,
  down: false,
  left: false, 
  right: false,
  click: false,
  angle: 0
}

console.log({a: app.view})
document.getElementById('gameDiv').appendChild(app.view)

// Precarga de las imagenes
PIXI.loader
  .add('client/img/spaceships/F5S4.png')
  .add('client/img/bullets/bala.png')
  .add('client/img/background/nebula.jpg')
  .load(setup)

// Datos de sockets
let playerShip = {}
let ships = []
let printedShips = [] // Para hacerlo mas comodo
let bullets = []
let printedBullets = [] // Para hacerlo mas comodo

const username = 'Test'
const password = 'Test'

const socket = io('http://localhost:2000')
socket.on('connected', function(data) {
  playerShip.id = data.id
  socket.emit('signUp', { username, password })
})

socket.on('signUpResponse', (data) => {
  console.log(data)
  socket.emit('signIn', { username, password })
})

socket.on('signInResponse', (data) => {
  console.log(data)
})

let text

function setup() {
  // Asignamos los sprites a variables para poder usarlos, en el caso de background esta declarado como local de esta funcion, si quieres manipularlo, tendras que sacarlo como las otras
  const background = new PIXI.Sprite(PIXI.loader.resources['client/img/background/nebula.jpg'].texture)
  playerShip.sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/spaceships/F5S4.png'].texture)

  // Para imprimirlo en el centro
  playerShip.sprite.x = 250
  playerShip.sprite.y = 250

  text = new PIXI.Text('YO',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
  text.x = playerShip.sprite.x
  text.y = playerShip.sprite.y + 50

  // Para que el punto de rotacion sea el centro de la nave y no el punto (0, 0)
  playerShip.sprite.anchor.x = 0.5
  playerShip.sprite.anchor.y = 0.5
  playerShip.sprite.scale.x = 0.5
  playerShip.sprite.scale.y = 0.5
  // A;adimos imagenes, se pueden eliminar mas tarde, aunque estas dos seguramente esten todo el tiempo, por eso las he a;adido en setup
  app.stage.addChild(background)
  app.stage.addChild(playerShip.sprite)
  app.stage.addChild(text)
  app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
  

  const playerPosition = ships.findIndex(ship => ship.id === playerShip.id)
  playerShip.sprite.x = ships[playerPosition].x
  playerShip.sprite.y = ships[playerPosition].y
  playerShip.sprite.rotation = controls.angle

  text.x = playerShip.sprite.x
  text.y = playerShip.sprite.y + 50

  ships.forEach(ship => {
    if(ship.id !== playerShip.id) {
      const position = printedShips.findIndex((printedShip) => printedShip.id === ship.id)
      if(position === -1) {
        console.log('Pintando a ' + ship.id)
        const sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/spaceships/F5S4.png'].texture)
        sprite.x = ship.x
        sprite.y = ship.y
        sprite.anchor.x = 0.5
        sprite.anchor.y = 0.5
        sprite.scale.x = 0.5
        sprite.scale.y = 0.5
        sprite.rotation = ship.angle
        printedShips.push({ id: ship.id, sprite})
        app.stage.addChild(sprite)
      } else {
        const sprite = printedShips[position].sprite
        sprite.x = ship.x
        sprite.y = ship.y
        sprite.rotation = ship.angle
      }
    }
  });

  let toDelete = []

  printedShips.forEach((printedShip, index) => {
    const position = ships.findIndex((ship) => printedShip.id === ship.id)

    if(position === -1) {
      app.stage.removeChild(printedShips[index].sprite)
      toDelete.push(printedShip.id)
    }
  })

  toDelete.forEach(id => {
    const position = printedShips.findIndex(printedShip => printedShip.id === id)
    printedShips.splice(position, 1)
  })

  bullets.forEach(bullet => {
    const position = printedBullets.findIndex((printedBullet) => printedBullet.id === bullet.id)
    if(position === -1) {
      const sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/bullets/bala.png'].texture)
      sprite.x = bullet.x
      sprite.y = bullet.y
      printedBullets.push({ id: bullet.id, sprite })
      app.stage.addChild(sprite)
    } else {
      const sprite = printedBullets[position].sprite
      sprite.x = bullet.x
      sprite.y = bullet.y
    }
  });

  let bulletsToDelete = []

  printedBullets.forEach((printedBullet, index) => {
    const position = bullets.findIndex((bullet) => printedBullet.id === bullet.id)

    if(position === -1) {
      app.stage.removeChild(printedBullets[index].sprite)
      bulletsToDelete.push(printedBullet.id)
    }
  })

  bulletsToDelete.forEach(id => {
    const position = printedBullets.findIndex(printedBullet => printedBullet.id === id)
    printedBullets.splice(position, 1)
  })
}



function getMousePos(evt) {
    return {
        x: evt.clientX - app.view.offsetLeft,
        y: evt.clientY - app.view.offsetTop
    }
}

app.view.addEventListener('mousemove', function (event) {
    const mousePos = getMousePos(event)
    const d = {
        x: mousePos.x - (playerShip.sprite.x || 250),
        y: mousePos.y - (playerShip.sprite.y || 250)
    }

    controls.angle = Math.atan2(d.y, d.x)
}, false)

document.addEventListener('keydown', (event) => {
  
  switch (event.keyCode) {
    case 83:
      controls.up = true
      break;
    case 87:
      controls.down = true;
      break;
    case 68:
      controls.right = true;
      break;
    case 65:
      controls.left = true;
      break;
    
  }
})

document.addEventListener('keyup', (event) => {
  
  switch (event.keyCode) {
    case 83:
      controls.up = false
      break;
    case 87:
      controls.down =false;
      break;
    case 68:
      controls.right = false;
      break;
    case 65:
      controls.left = false;
      break;
    
  }
})


document.addEventListener('mousedown',(event) => {
    controls.click = true;
})
document.addEventListener('mouseup',(event) => {
    controls.click = false;
})
setInterval(function() {
  socket.emit('keydown', controls)
}, 100)

socket.on('data', (data) => {
  
  ships = data.naves
  bullets = data.disparos
})