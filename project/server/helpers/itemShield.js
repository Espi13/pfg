const Item = require('./item.js')

class ItemShield extends Item  {
    constructor(id,itemName){
        super(id,itemName)
        this.shield = 1
    }
    updateItem(naves, items) {
        super.updateItem(naves, items)
            .then((nave) => {
                if(nave !== -1) {
                    naves[nave].shield += this.shield
                    if (naves[nave].shield > 5) {
                        naves[nave].shield = 5
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

module.exports = ItemShield