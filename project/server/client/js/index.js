'use strict'

// TODO: A;adir toda la logica de inicio de sesion


const app = new PIXI.Application({
  width: 1700,
  height: 900,
  transparent: true,
  antialias: true
})
const graphics = new PIXI.Graphics();
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
  .add('client/img/spaceships/nave.png')
  .add('client/img/spaceships/nave_enemy.png')
  .add('client/img/bullets/bala.png')
  .add('client/img/bullets/bala_enemy.png')
  .add('client/img/background/nebula.jpg')
  .add('client/img/items/health-transparent.png')
  .add('client/img/items/speed-transparent.png')
  .add('client/img/items/overpower-transparent.png')
  .add('client/img/items/shield-transparent.png')
  .add('client/img/items/speedshot-transparent.png')
  .add('client/img/items/shield-image.png')
  .add('client/img/items/shield-image-enemy.png')
  .load(setup)

// Datos de sockets
let playerShip = {}
let ships = []
let printedShips = [] // Para hacerlo mas comodo
let printedShields = []
let bullets = []
let printedBullets = [] // Para hacerlo mas comodo
let items = []

let printedItems = []
const username = 'Test'
const password = 'Test'
const spriteShield = {}

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
  playerShip.sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/spaceships/nave.png'].texture)        
  spriteShield.sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/shield-image.png'].texture)
  spriteShield.sprite.x = -100
  spriteShield.sprite.y = -100
  
  

  // Para imprimirlo en el centro
  playerShip.sprite.x = 250
  playerShip.sprite.y = 250

  
  
  text = new PIXI.Text('YO',{fontFamily : 'Arial', fontSize: 24, fill : 0xff1010, align : 'center'});
  text.x = playerShip.sprite.x
  text.y = playerShip.sprite.y + 50

  // Para que el punto de rotacion sea el centro de la nave y no el punto (0, 0)
  playerShip.sprite.anchor.x = 0.5
  playerShip.sprite.anchor.y = 0.5

  // A;adimos imagenes, se pueden eliminar mas tarde, aunque estas dos seguramente esten todo el tiempo, por eso las he a;adido en setup
  app.stage.addChild(background)
  app.stage.addChild(playerShip.sprite)
  app.stage.addChild(spriteShield.sprite)
  app.stage.addChild(text)
  app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
  

  const playerPosition = ships.findIndex(ship => ship.id === playerShip.id)
  playerShip.sprite.x = ships[playerPosition].x
  playerShip.sprite.y = ships[playerPosition].y
  playerShip.sprite.rotation = controls.angle
  graphics.lineStyle(2, 0x000000, 1);
  graphics.beginFill(0xFFFFFF, 0.1);
  graphics.drawRoundedRect(600, 800, 500, 50, 10);
  graphics.beginFill(0xFB0101, 1);
  let hp = ships[playerPosition].hp *50
  graphics.drawRoundedRect(600, 800, hp, 50, 10);
  graphics.endFill();
  app.stage.addChild(graphics);
  if(ships[playerPosition].shield > 0) { 
    spriteShield.sprite.x = ships[playerPosition].x
    spriteShield.sprite.y = ships[playerPosition].y
    spriteShield.sprite.anchor.x = 0.5
    spriteShield.sprite.anchor.y = 0.5
  }
  else {
    spriteShield.sprite.x = - 100
    spriteShield.sprite.y = - 100
  }
  
  text.x = playerShip.sprite.x
  text.y = playerShip.sprite.y + 50
  
  items.forEach((item) => {
    
    const position = printedItems.findIndex((printedItem) => printedItem.id === item.id)
    if (position === -1) {
      let sprite
      switch (item.type) {
        case "ItemHP":
          sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/health-transparent.png'].texture)
          break;
        case "ItemSpeed":
          sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/speed-transparent.png'].texture)
          break;
        case "ItemShield":
          sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/shield-transparent.png'].texture)
          break;
        case "ItemRecoil":
          sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/speedshot-transparent.png'].texture)
          break;
        case "ItemStar":
          sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/overpower-transparent.png'].texture)
          break;
      }

      sprite.x = item.x
      sprite.y = item.y
      printedItems.push({ id: item.id, sprite})
      app.stage.addChild(sprite)
      
    }
  });
  
  let itemToDelete = []
  printedItems.forEach((printedItem,index)=> {
    const position =  items.findIndex((item) => printedItem.id ===  item.id)
    
    if (position === -1) {
      app.stage.removeChild(printedItems[index].sprite)
      itemToDelete.push(printedItem.id)
    }
  })

  

  itemToDelete.forEach(id => {
    const position = printedItems.findIndex(printedItem => printedItem.id === id)
    printedItems.splice(position, 1)
  })

  ships.forEach(ship => {
    if(ship.id !== playerShip.id) {
      const position = printedShips.findIndex((printedShip) => printedShip.id === ship.id)
      if(position === -1) {
        console.log('Pintando a ' + ship.id)
        
        
        
        const sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/spaceships/nave_enemy.png'].texture)
        sprite.x = ship.x
        sprite.y = ship.y
        sprite.anchor.x = 0.5
        sprite.anchor.y = 0.5

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
    
    if(ships[position].shield > 0 &&  !ships[position].haveShield) { 
      const spriteShieldEnemy = new PIXI.Sprite(PIXI.loader.resources['client/img/items/shield-image-enemy.png'].texture)
      spriteShieldEnemy.x = ships[position].x
      spriteShieldEnemy.y = ships[position].y
      spriteShieldEnemy.anchor.x = 0.5
      spriteShieldEnemy.anchor.y = 0.5
      ships[position].haveShield = true
      printedShields.push({ id: printedShip.id, spriteShieldEnemy})
      app.stage.addChild(spriteShieldEnemy)
    }
    else if (ships[position].haveShield) {
      const spriteShieldEnemy = printedShields[position].spriteShieldEnemy
      spriteShieldEnemy.x = ships[position].x
      spriteShieldEnemy.y = ships[position].y
      console.log("entra aqui");
    }
    else if (ships[position].haveShield && ships[position].shield == 0) {
      app.stage.removeChild(spriteShieldEnemy,spriteShieldEnemy)
      shieldToDelete.push( printedShields.id)
      
    }
    

    if(position === -1) {
      console.log('Borrando nave')
      app.stage.removeChild(printedShips[index].sprite)
      toDelete.push(printedShip.id)
    }
  })
  let shieldToDelete = []
  toDelete.forEach(id => {
    const position = printedShips.findIndex(printedShip => printedShip.id === id)
    printedShips.splice(position, 1)
  })



  bullets.forEach(bullet => {
    const position = printedBullets.findIndex((printedBullet) => printedBullet.id === bullet.id)
    if(position === -1) {
      let sprite
      if(bullet.parentID === playerShip.id) {
        sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/bullets/bala.png'].texture)
      } else {
        sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/bullets/bala_enemy.png'].texture)        
      }
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
  items = data.items
})