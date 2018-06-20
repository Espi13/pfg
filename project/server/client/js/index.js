'use strict'

// TODO: A;adir toda la logica de inicio de sesion

const app = new PIXI.Application({
  width: 1920,
  height: 947,
  transparent: true,
  antialias: true
})
const hpbackground = new PIXI.Graphics()
const hpbar = new PIXI.Graphics()
const shieldbackground = new PIXI.Graphics()
const shieldbar = new PIXI.Graphics()



const mousePos = {
  x: 0,
  y: 0
}

const printedPlayerItems = {
  recoil: false,
  speed: false
}

var hpTextStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 30,
  fontWeight: 'bold',
  fill: ['#01DF01', '#FFFFFF'], // gradient
  stroke: '#000000',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440
})
var hpText = new PIXI.Text('10  /  10', hpTextStyle)
hpText.x = 600
hpText.y = 875


var shieldTextStyle = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 30,
  fontWeight: 'bold',
  fill: ['#4492f3', '#FFFFFF'], // gradient
  stroke: '#000000',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440
})
var shieldText = new PIXI.Text('0 / 5', shieldTextStyle)
shieldText.x = 1225
shieldText.y = 875






const controls = {
  up: false,
  down: false,
  left: false, 
  right: false,
  click: false,
  angle: 0
}

console.log({a: app.view})

// Datos de sockets
let playerShip = {}
let ships = []
let printedShips = [] 
let printedShields = []
let bullets = []
let printedBullets = [] 
let items = []
var hpafter = 10
var hpafterEnemy = 10
var shieldafterEnemy = 0
let scoreShips = []
const enemyBars = false

let printedItems = []
//const username = 'Test'
//const password = 'Test'
const spriteShield = {}

const socket = io('http://80.211.134.215:3000')
//const socket = io('http://localhost:3000')

var container = document.getElementById('container');
var signDiv = document.getElementById('signDiv');
var signDivSignIn = document.getElementById('signDiv-signIn');
var signDivSignUp = document.getElementById('signDiv-signUp');

var username = ""
var password = ""

socket.on('connected', function(data) {
  signDivSignUp.onclick = function () {
    
    username = document.getElementById('signDiv-username').value
    password = document.getElementById('signDiv-password').value;
    socket.emit('signUp',{username, password});
  }
  
  signDivSignIn.onclick = function () { 
    
    username = document.getElementById('signDiv-username').value
    password = document.getElementById('signDiv-password').value;
    socket.emit('signIn',{username,password});
  }
})

socket.on('signUpResponse', (data) => {
  if(data.success) {
    alert("has sido registrado correctamente, iniciando sesion...")
    socket.emit('signIn', { username, password })
}
else {
   alert("No es posible realizar el registro ");
  }
})

socket.on('signInResponse', (data) => {
  if(data.success) {
    container.style.display="none";
    gameDiv.style.display="block";

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
}
else {
   alert("No es posible realizar el inicio de sesion ");
   
}
})

socket.on('idAssigned', ({ id }) => {
  playerShip.id = id
})


function setup() {
  document.getElementById('gameDiv').appendChild(app.view)
  setInterval(function() {
    controls.angle = getAngle()
    socket.emit('keydown', controls)
  }, 100)

  
  const background = new PIXI.Sprite(PIXI.loader.resources['client/img/background/nebula.jpg'].texture)
  playerShip.sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/spaceships/nave.png'].texture)        
  spriteShield.sprite = new PIXI.Sprite(PIXI.loader.resources['client/img/items/shield-image.png'].texture)
  spriteShield.sprite.x = -100
  spriteShield.sprite.y = -100

 
  playerShip.sprite.x = 250
  playerShip.sprite.y = 250

  playerShip.sprite.anchor.x = 0.5
  playerShip.sprite.anchor.y = 0.5

  

  hpbackground.lineStyle(2, 0x000000, 1)
  hpbackground.beginFill(0xFFFFFF, 0.1)
  hpbackground.drawRoundedRect(400, 870, 500, 50, 10)
  hpbar.beginFill(0x01DF01, 1)
  hpbar.drawRoundedRect(0, 0, 500, 50, 10)
  hpbar.x = 400
  hpbar.y = 870
  hpbar.endFill()

  shieldbackground.lineStyle(2, 0x000000, 1)
  shieldbackground.beginFill(0xFFFFFF, 0.1)
  shieldbackground.drawRoundedRect(1000, 870, 500, 50, 10)
  shieldbar.beginFill(0x4492f3, 1)
  shieldbar.drawRoundedRect(0, 0, 500, 50, 10)
  shieldbar.width = 0
  shieldbar.x = 1000
  shieldbar.y = 870
  shieldbar.endFill()

  app.stage.addChild(background)
  app.stage.addChild(playerShip.sprite)
  app.stage.addChild(spriteShield.sprite)
  app.stage.addChild(hpbackground);
  app.stage.addChild(hpbar);
  app.stage.addChild(shieldbackground);
  app.stage.addChild(shieldbar);
  app.stage.addChild(hpText);
  app.stage.addChild(shieldText);
  app.ticker.add(delta => gameLoop(delta))
}

function gameLoop(delta) {
  

  const playerPosition = ships.findIndex(ship => ship.id === playerShip.id)
  playerShip.sprite.x = ships[playerPosition].x
  playerShip.sprite.y = ships[playerPosition].y
  playerShip.sprite.rotation = controls.angle
  playerShip.score = ships[playerPosition].score

  document.querySelector('#score > span').innerText = playerShip.score
  
  if (ships[playerPosition].hp !== hpafter){
    hpafter = ships[playerPosition].hp
    let hp = ships[playerPosition].hp * 50
    hpbar.width = hp
    hpText.text = ships[playerPosition].hp + "  /  " + ships[playerPosition].hpMax

  }
  
  if(ships[playerPosition].shield > 0) { 
    spriteShield.sprite.x = ships[playerPosition].x
    spriteShield.sprite.y = ships[playerPosition].y
    spriteShield.sprite.anchor.x = 0.5
    spriteShield.sprite.anchor.y = 0.5
    let shield = ships[playerPosition].shield * 100
    
    shieldbar.width = shield
    shieldText.text = ships[playerPosition].shield + " / 5"
  }
  
  else {
    shieldbar.width = 0
    shieldText.text = ships[playerPosition].shield + " / 5"
    spriteShield.sprite.x = - 100
    spriteShield.sprite.y = - 100
  }
  const itemsContainer = document.querySelector('.items-container')
  if (ships[playerPosition].recoilActive && !printedPlayerItems.recoil) {
    printedPlayerItems.recoil = true
    itemsContainer.innerHTML += '<img src="client/img/items/speedshot-transparent.png" title="recoil" class="player-item">'
  }
  else if(!ships[playerPosition].recoilActive && printedPlayerItems.recoil) {
    printedPlayerItems.recoil = false
    const a = document.querySelector('img[title="recoil"]')
    console.log(a)
    a.remove()
  }
  if ( ships[playerPosition].speedActive && !printedPlayerItems.speed) {
    printedPlayerItems.speed = true
    itemsContainer.innerHTML += '<img src="client/img/items/speed-transparent.png" title="speed" class="player-item">'
 }
 else if(!ships[playerPosition].speedActive && printedPlayerItems.speed) {
   printedPlayerItems.speed = false
  const a = document.querySelector('img[title="speed"]')
    console.log(a)
    a.remove()
 }
 
  
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
        const hpbackgroundEnemy = new PIXI.Graphics()
        const hpbarEnemy = new PIXI.Graphics()
        const nameText = new PIXI.Text();
        const shieldbarEnemy = new PIXI.Graphics()
        sprite.x = ship.x
        sprite.y = ship.y
        sprite.anchor.x = 0.5
        sprite.anchor.y = 0.5
        sprite.rotation = ship.angle
        hpbackgroundEnemy.lineStyle(2, 0x000000, 1)
        hpbackgroundEnemy.beginFill(0xFFFFFF, 0.1)
        hpbackgroundEnemy.drawRoundedRect(0, 0, 50, 10, 2)
        hpbackgroundEnemy.x = ship.x -45
        hpbackgroundEnemy.y = ship.y + 30
        hpbarEnemy.beginFill(0xFA0101, 1)
        hpbarEnemy.drawRoundedRect(0, 0, 50, 10, 2)
        hpbarEnemy.x = ship.x - 25
        hpbarEnemy.y = ship.y + 50
        hpbarEnemy.endFill()
        shieldbarEnemy.beginFill(0x4492f3, 1)
        shieldbarEnemy.drawRoundedRect(0, 0, 50, 10, 2)
        shieldbarEnemy.width = 0
        shieldbarEnemy.x = ship.x - 25
        shieldbarEnemy.y = ship.y + 50
        shieldbarEnemy.endFill()
        var nameStyle = new PIXI.TextStyle({
          fontFamily: 'Arial',
          fontSize: 14,
          fontWeight: 'bold',
          fill: '#FFFFFF', 
          stroke: '#000000',
          strokeThickness: 5,
          wordWrap: true,
          wordWrapWidth: 440
      });
        var name = ship.name.toUpperCase()
        nameText.style = nameStyle
        nameText.text = name
        nameText.x = ship.x - 25;
        nameText.y =  ship.y - 50;

        printedShips.push({ id: ship.id, sprite, hpbackgroundEnemy, hpbarEnemy, nameText , shieldbarEnemy})
        app.stage.addChild(sprite)
        app.stage.addChild(hpbackgroundEnemy)
        app.stage.addChild(hpbarEnemy)
        app.stage.addChild(shieldbarEnemy)
        app.stage.addChild(nameText);
      } else {
        const sprite = printedShips[position].sprite
        const hpbackgroundEnemy = printedShips[position].hpbackgroundEnemy
        const hpbarEnemy = printedShips[position].hpbarEnemy
        const nameText = printedShips[position].nameText
        const shieldbarEnemy = printedShips[position].shieldbarEnemy
        console.log("enttra")
        sprite.x = ship.x
        sprite.y = ship.y
        sprite.rotation = ship.angle
        hpbackgroundEnemy.x = ship.x -25
        hpbackgroundEnemy.y = ship.y + 50
        hpbarEnemy.x = ship.x - 25
        hpbarEnemy.y = ship.y + 50
        shieldbarEnemy.x = ship.x - 25
        shieldbarEnemy.y = ship.y + 50
        nameText.x = ship.x - 25;
        nameText.y =  ship.y - 50;
        if (hpafterEnemy !== ship.hp) {
          hpafterEnemy = ship.hp
          hpbarEnemy.width = ship.hp * 5

        }
        if(shieldafterEnemy !== ship.shield) {
          shieldafterEnemy = ship.shield
          shieldbarEnemy.width = ship.shield * 10
        }
      }
      
    }
    
  });

  const scores = document.querySelector('#top > ul')
  scores.innerHTML = ''

  ships.slice(0, 5).forEach(({id, name, score}) => {
    if(id === playerShip.id) {
      scores.innerHTML += `<li><span class="player-score">${name} - ${score}</span></li>`
    } else {
      scores.innerHTML += `<li><span class="enemy-score">${name} - ${score}</span></li>`
    }
  })

  let toDelete = []

  printedShips.forEach((printedShip) => {
    const position = ships.findIndex((ship) => printedShip.id === ship.id)
    const shieldPosition = printedShields.findIndex((shield) => shield.id === printedShip.id)
    if(position !== -1 && ships[position].shield > 0) { 
      if(shieldPosition === -1) {
        const spriteShieldEnemy = new PIXI.Sprite(PIXI.loader.resources['client/img/items/shield-image-enemy.png'].texture)
        spriteShieldEnemy.x = ships[position].x
        spriteShieldEnemy.y = ships[position].y
        spriteShieldEnemy.anchor.x = 0.5
        spriteShieldEnemy.anchor.y = 0.5
        ships[position].haveShield = true
        printedShields.push({ id: printedShip.id, sprite: spriteShieldEnemy})
        app.stage.addChild(spriteShieldEnemy)
      } else {
        printedShields[shieldPosition].sprite.x = ships[position].x
        printedShields[shieldPosition].sprite.y = ships[position].y
      }
    } else if(shieldPosition !== -1) {
      app.stage.removeChild(printedShields[shieldPosition].sprite)
      printedShields.splice(shieldPosition, 1)
    }
  })


  printedShips.forEach((printedShip, index) => {
    const position = ships.findIndex((ship) => printedShip.id === ship.id)
   
    if(position === -1) {
      console.log('Borrando nave')
      app.stage.removeChild(printedShips[index].hpbackgroundEnemy)
      app.stage.removeChild(printedShips[index].hpbarEnemy)
      app.stage.removeChild(printedShips[index].nameText)
      app.stage.removeChild(printedShips[index].shieldbarEnemy)
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

      let audio = new Audio('client/sound/shoot.wav')
      audio.play();
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

function getAngle() {
  const d = {
    x: mousePos.x - (playerShip.sprite.x || 250),
    y: mousePos.y - (playerShip.sprite.y || 250)
  }

  return Math.atan2(d.y, d.x)
}

app.view.addEventListener('mousemove', function (event) {
    const {x, y} = getMousePos(event)
    mousePos.x = x
    mousePos.y = y
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

socket.on('data', (data) => {
  
  ships = data.naves.sort((a, b) => b.score > a.score)
  bullets = data.disparos
  items = data.items
})

socket.on('muerte', () => {
  let audio = new Audio('client/sound/explosion.wav')
  audio.play();
})
