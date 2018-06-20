const express = require('express')
const mongoose = require('mongoose')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server)

const Player = require('./helpers/nave.js')
const Bala = require('./helpers/nave.js')
const User = require('./models/user.js')
const ItemHP = require('./helpers/itemHp.js');
const ItemSpeed = require('./helpers/itemSpeed.js');
const ItemShield = require('./helpers/itemShield.js');
const ItemRecoil = require('./helpers/itemRecoil.js');
const ItemStar = require('./helpers/itemStar.js');


const ItemTypes = [
  { name: 'ItemStar', prob: 10, ref: ItemStar },
  { name: 'ItemHP', prob: 22.5, ref: ItemHP },
  { name: 'ItemSpeed', prob: 22.5, ref: ItemSpeed },
  { name: 'ItemRecoil', prob: 22.5, ref: ItemRecoil },
  { name: 'ItemShield', prob: 22.5, ref: ItemShield }
]

const naves = []
const disparos = []
const items = []

app.get ('/', function (req,res) {
    console.log(__dirname)
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

io.sockets.on('connection', function (socket) {
  let id
  let jugador 
  
  socket.emit('connected')

  socket.on('signIn', async function (data) {
    try {
      const user = await User.get({ name: data.username })
      const validPassword = await user.comparePassword(data.password)

      if(validPassword) {
        const userPosition = naves.findIndex((nave) => nave.name === user.name)
        if (userPosition !== -1) {
          socket.emit('signInResponse', { success: false });
        }
        else {
          id = naves.length > 0 ? naves.slice(-1)[0].id + 1 : 0
          socket.emit('idAssigned', { id })
          jugador = new Player(id)
          jugador.setName(user.name)
          console.log('Oye! Que ' + user.name + ' con el ID ' + id + ' se ha conectado')
          naves.push(jugador)
          socket.emit('signInResponse', { success: true });
        }
        
        
      } else {
        socket.emit('signInResponse', { success: false });
      }
    } catch(error) {
      console.error(error)
      socket.emit('signInResponse', { success: false });
    }
  });

  socket.on('signUp', async function (data) {
    try {
      const user = await User.register({ name: data.username, password: data.password })
      socket.emit('signUpResponse',{success:true});
    } catch(error) {
      console.error(error)
      socket.emit('signUpResponse',{success:false});
    }
  });

  socket.on('disconnect', function () {
    if (jugador) {
      const ids = disparos.filter((disparo) => disparo.parentID === jugador.id).map((disparo) => disparo.id)
      ids.forEach((id) => {
        const pos = disparos.findIndex(disparo => disparo.id === id)
        disparos.splice(pos, 1)
      })

      const position = naves.findIndex(nave => nave.id === jugador.id)
      console.log('Dile adios a ID ' + id + ' aka ' + jugador.name)
      naves.splice(position, 1)
    }
  });

  socket.on('sendMsgToServer', function (data) {
    var playerName = jugador.name;
    //socket.broadcast.emit('addToChat')
    io.emit('addToChat', playerName + ': ' + data.message)
  });

  socket.on('keydown', function (data) {
    if (jugador) jugador.update(data)
  })
})

setInterval(function () {
  // Actualizamos todas las posiciones de las naves
  naves.forEach(function (nave, index) {
    nave.updatePosition(disparos)
  })
  //Actualizamos todas las posiciones de las balas
  disparos.forEach(function (bala, index) {
    bala.updatePosition(naves, disparos, () => {
      io.emit('muerte')
    })
  })
  items.forEach(function(item) {
    item.updateItem(naves,items)
  })
  io.emit('data', {
    naves,
    disparos,
    items
  })
}, 5)

setInterval(function() {
  var random = Math.floor(Math.random() * 10000) / 100
  for(let i = 0, amount = 0; i < ItemTypes.length && amount < random; i++) {
    if(random >= amount && random < amount + ItemTypes[i].prob) {
      // TODO: Logica para añadir item
      const id = items.length > 0 ? items.slice(-1)[0].id + 1 : 0
      const item = new ItemTypes[i].ref(id, ItemTypes[i].name)
      items.push(item);
    }

    amount += ItemTypes[i].prob
  }

},7000)

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/game')
  .then(() => {
    server.listen(3000)
    
  })
