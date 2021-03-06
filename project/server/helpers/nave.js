const Bala = require('./bala.js')

class Nave {
  constructor(id) {
    this.id = id
    this.x =  Math.floor(Math.random () *1450) + 150
    this.y = Math.floor(Math.random () *550) + 90
    this.r = 40
    this.spdX = 0
    this.spdY = 0
    this.pressingRight = false
    this.pressingLeft = false
    this.pressingUp = false
    this.pressingDown = false
    this.pressingAttack = false
    this.angle = 0
    this.maxSpd = 4
    this.hp = 10
    this.hpMax = 10
    this.score = 0
    this.name = null
    this.lastBullet = 0
    this.shield = 0
    this.recoil = 1000
    this.recoilActive = false
    this.starActive = false
    this.speedActive = false
  }

  setName(name) {
    this.name = name
  }

  update(data) {
    this.pressingLeft = data.left
    this.pressingRight = data.right
    this.pressingUp = data.up
    this.pressingDown = data.down
    this.pressingAttack = data.click
    this.angle = data.angle
  }

  updatePosition(disparos) {

    if (this.pressingRight && this.x <=1600)
      this.spdX = this.maxSpd
    else if (this.pressingLeft && this.x >=80)
      this.spdX = -this.maxSpd
    else
      this.spdX = 0
      
    if (this.pressingUp && this.y <=800)
      this.spdY = this.maxSpd
    else if (this.pressingDown && this.y>=80)
      this.spdY = -this.maxSpd
    else
      this.spdY = 0

    this.x += this.spdX
    
    
      this.y += this.spdY
    if(this.pressingAttack && this.lastBullet + this.recoil <= new Date().getTime()) {
      this.lastBullet = new Date().getTime()
      const id = disparos.length > 0 ? disparos.slice(-1)[0].id + 1 : 0
      const bala = new Bala(id, this.id, this.angle, this.x, this.y)
      disparos.push(bala)
    }
    
  }

  updateScore(n) {
    this.score += n
  }

  changeLife(hp) {
    if (this.shield > 0) {
      this.shield--
      this.r = 50
      
    }
    else {
      
      this.hp += hp
    }
    
  }
}

module.exports = Nave