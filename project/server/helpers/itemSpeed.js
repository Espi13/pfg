const Item = require('./item.js')

class ItemSpeed extends Item  {
    constructor(id,itemName){
        super(id,itemName)
        this.maxSpd = 6
    }

    updateItem(naves, items) {
        super.updateItem(naves, items)
            .then((nave) => {
                if(nave !== -1) {
                    naves[nave].maxSpd = this.maxSpd
                    naves[nave].speedActive = true;
                    setTimeout (function() {
                        naves[nave].maxSpd = 4
                        naves[nave].speedActive = false;
                    },10000)
                    
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
}
module.exports = ItemSpeed;
