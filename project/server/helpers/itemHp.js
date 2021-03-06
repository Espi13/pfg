const Item = require('./item.js')

class ItemHP extends Item  {
    constructor(id,itemName){
        super(id,itemName)
        this.heal = 5;
    }

    updateItem(naves, items) {
        super.updateItem(naves, items)
            .then((nave) => {
                if(nave !== -1) {
                
                    naves[nave].hp += this.heal

                    if (naves[nave].hp > naves[nave].hpMax) {
                        naves[nave].hp = naves[nave].hpMax
                    }
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
}

module.exports = ItemHP