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
const itemHp = require('./helpers/itemHp.js');

const naves = []
const disparos = []

app.get ('/', function (req,res) {
    console.log(__dirname)
    res.sendFile(__dirname + '/client/index.html');
});

app.use('/client', express.static(__dirname + '/client'));

io.sockets.on('connection', function (socket) {
  const id = naves.length > 0 ? naves.slice(-1)[0].id + 1 : 0
  const jugador = new Player(id)
  naves.push(jugador)

  console.log('Nosequien se ha conectado con el ID ' + id)

  socket.emit('connected', {
    id
  })

  socket.on('signIn', async function (data) {
    try {
      const user = await User.get({ name: data.username })
      const validPassword = await user.comparePassword(data.password)

      if(validPassword) {
        jugador.setName(user.name)
        console.log('Oye! Que nosequien con el ID ' + id + ' era ' + user.name)
        socket.emit('signInResponse', { success: true });
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
    const ids = disparos.filter((disparo) => disparo.parentID === jugador.id).map((disparo) => disparo.id)
    ids.forEach((id) => {
      const pos = disparos.findIndex(disparo => disparo.id === id)
      disparos.splice(pos, 1)
    })

    const position = naves.findIndex(nave => nave.id === jugador.id)
    console.log('Dile adios a ID ' + id + ' aka ' + jugador.name)
    naves.splice(position, 1)
  });

  socket.on('sendMsgToServer', function (data) {
    var playerName = jugador.name;
    //socket.broadcast.emit('addToChat')
    io.emit('addToChat', playerName + ': ' + data.message)
  });

  socket.on('keydown', function (data) {
    jugador.update(data)
  })
})

setInterval(function () {
  // Actualizamos todas las posiciones de las naves
  naves.forEach(function (nave, index) {
    nave.updatePosition(disparos)
  })
  //Actualizamos todas las posiciones de las balas
  disparos.forEach(function (bala, index) {
    bala.updatePosition(naves, disparos)
  })

  io.emit('data', {
    naves,
    disparos
  })
}, 10)

mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/game')
  .then(() => {
    server.listen(2000)
    
  })

// Cliente
/*puntuaciones = []
naves.forEach(
  puntuaciones.push(nave.score)
)

puntuaciones = naves.map((nave) => nave.score)

puntuaciones.order((a, b) => a > b)*/