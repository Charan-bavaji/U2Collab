import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import cookie from 'cookie'
import roomSocket from './room.socket.js'
import editorSocket from './editor.socket.js'
import whiteboardSocket from './whiteboard.socket.js'
export const initSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: { origin: process.env.CLIENT_URL, credentials: true }
    })

    // auth middleware — reads same HttpOnly cookie
    io.use((socket, next) => {
        const cookies = cookie.parse(socket.handshake.headers.cookie || '')
        const token = cookies.u2collab_token
        if (!token) return next(new Error('Unauthorized'))
        try {
            socket.user = jwt.verify(token, process.env.JWT_SECRET)
            next()
        } catch {
            next(new Error('Invalid token'))
        }
    })

    io.on('connection', (socket) => {
        roomSocket(io, socket)
        editorSocket(io, socket)
        whiteboardSocket(io, socket)
    })

    return io
}