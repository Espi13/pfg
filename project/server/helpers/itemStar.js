const Item = require('./item.js')

class ItemStar extends Item  {
    constructor(id,itemName){
        super(id,itemName)
        this.recoil = 500
        this.heal = 10
        this.maxSpd = 7
    }

    updateItem(naves, items) {
        super.updateItem(naves, items)
            .then((nave) => {
                if(nave !== -1) {
                    naves[nave].recoil = this.recoil
                    naves[nave].hp = this.heal
                    naves[nave].maxSpd = this.maxSpd
                    naves[nave].speedActive = true;
                    naves[nave].recoilActive = true;
                    setTimeout (function() {
                        naves[nave].recoil = 1000
                        naves[nave].maxSpd = 4
                        naves[nave].speedActive = false
                        naves[nave].recoilActive = false
                    },10000)
                    
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

module.exports = ItemStar