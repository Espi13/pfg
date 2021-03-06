const Item = require('./item.js')

class ItemRecoil extends Item  {
    constructor(id,itemName){
        super(id,itemName)
        this.recoil = 500
    }

    updateItem(naves, items) {
        super.updateItem(naves, items)
            .then((nave) => {
                if(nave !== -1) {
                    naves[nave].recoil = this.recoil
                    naves[nave].recoilActive = true
                    setTimeout (function() {
                        naves[nave].recoil = 1000
                        naves[nave].recoilActive = false
                    },10000)
                    
                }
            })
            .catch((error) => {
                console.error(error)
            })
    }
}
module.exports = ItemRecoil