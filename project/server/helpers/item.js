class Item {
    constructor(id, type) {
        this.id = id
        this.x =  Math.floor(Math.random () *1450) +150
        this.y = Math.floor(Math.random () *550) +90
        this.r = 30
        this.timer = 5 * 1000
        this.startTime = new Date().getTime()
        this.remove = false
        this.type = type
        this.action = null
    }
    updateItem(naves, items) {
        return new Promise((resolve) => {
            const nave = naves.findIndex((nave, index) => {
                let dist_X = nave.x - this.x
                let dist_Y = nave.y - this.y
                let dist = Math.sqrt(Math.pow(dist_X, 2) +Math.pow(dist_Y, 2))
                return dist <= this.r + nave.r 
            });

            if(nave !== -1 || this.startTime + this.timer <= new Date().getTime()) {
                const position = items.findIndex((item) => item.id === this.id)
                items.splice(position, 1)
            }            
            resolve(nave)
        }) 
    }
}


module.exports = Item;
