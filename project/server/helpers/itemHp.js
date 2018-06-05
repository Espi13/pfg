class ItemHp {
    constructor(id) {
        this.id = id
        this.parentID 
        this.x =  Math.floor(Math.random () *1450) +150; 
        this.y = Math.floor(Math.random () *550) +90;
        this.remove = false;
    }
    
}

module.exports = ItemHp;
