class Bala {
  constructor(id, parentID, angle, x, y) {
    this.id = id
    this.spdX = Math.cos(angle) * 10;
    this.spdY = Math.sin(angle) * 10;
    this.xO = x
    this.yO = y
    this.x = x
    this.y = y
    this.w = 40
    this.h = 40
    this.damage = -1
    this.parentID = parentID;
    this.removed = false;
  }

  updatePosition(naves, disparos) {
    if ((this.x>=0 && this.x<= 1700) && (this.y>=0 && this.y <=800)) {
      this.x += this.spdX
      this.y += this.spdY

    }
    else {
      const position = disparos.findIndex((disparo) => disparo.id === this.id)
      disparos.splice(position, 1)
      this.removed = true
    }

    naves.forEach((nave) => {
      if(this.parentID !== nave.id) {
        if(this.x + this.w / 2 >= nave.x - nave.w / 2 &&
          this.x - this.w / 2 <= nave.x + nave.w / 2 &&
          this.y + this.h / 2 >= nave.y - nave.h / 2 &&
          this.y - this.h / 2 <= nave.y + nave.h / 2) {
            nave.changeLife(this.damage)
           
            if (nave.hp ==0) {
              const position = disparos.findIndex((disparo) => disparo.id === this.id)
              disparos.splice(position, 1)
              this.removed = true
              nave.x = -100;
              nave.y = -100;
              var respawn =setInterval(function() {
                nave.x = Math.floor(Math.random () *1450) +150; 
                nave.y = Math.floor(Math.random () *550) +90;
                nave.hp =1;
                nave.score =0;
                clearInterval(respawn);
              },2000)
              
              
              this.score +=10;
            }
            const position = disparos.findIndex((disparo) => disparo.id === this.id)
            disparos.splice(position, 1)
            this.removed = true
          }
      }
    });

    if(!this.removed && Math.sqrt(Math.pow((this.x0 - this.x), 2) + Math.pow((this.y0 - this.y), 2) >= this.dist)) {
      const position = disparos.findIndex((disparo) => disparo.id === this.id)
      disparos.splice(position, 1)
    }    
  }
}

module.exports = Bala