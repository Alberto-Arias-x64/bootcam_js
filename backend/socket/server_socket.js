require('colors')
require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')
const { app } = require('../src/server')

const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: ["http://127.0.0.1", "http://192.168.31.236","https://9d43-186-84-90-81.ngrok.io"]
    }
});

let onlineUsers = [];

io.on('connection', socket => {
    socket.on('@client/new_user', data => {
        if (!onlineUsers.some(element => element.name == data.name)) {
            onlineUsers.push({ ...data, id_session: socket.id })
        }
        io.emit('@server/new_user', onlineUsers)
    })
    socket.on('disconnect', () => {
        const filtered = onlineUsers.filter(function (value, index, arr) {
            return value.id_session !== socket.id;
        });
        onlineUsers = filtered
        io.emit('@server/new_user', onlineUsers)
    })
    socket.on('@client/new_message', () => {
        setTimeout(() => {
            io.emit('@server/new_message', onlineUsers)
        }, 100);
    })
})

server.listen(process.env.PORT, () => {
    console.log(`Listen on port: ` + `${process.env.PORT}`.brightMagenta)
    console.log(`Enviroment: ` + `${process.env.NODE_ENV}`.yellow)
    console.log(`Socket status: ` + `${process.env.SOCKET}`.cyan)
})