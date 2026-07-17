import 'dotenv/config'   // ✅ MUST BE FIRST LINE
import mongoose from 'mongoose'  // ✅ MUST BE SECOND LINE
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from './config/passport.js'
import connectDB from './config/db.js'
import http from 'http'
import { initSocket } from './sockets/index.js'
import authRoutes from './routes/auth.routes.js'
import roomRoutes from './routes/room.routes.js'
connectDB()
const app = express()
const httpServer = http.createServer(app)
initSocket(httpServer)  // initialize Socket.IO with the HTTP server

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api/auth', authRoutes)
app.use('/api/rooms', roomRoutes)

// Devops: Health check endpoint to verify server and database connectivity
app.get('/api/health-broken', async (req, res) => {
  try {
    // mongoose readyState: 1 = connected
    const dbState = mongoose.connection.readyState;
    if (dbState !== 1) {
      return res.status(503).json({ status: 'error', db: 'disconnected' });
    }
    return res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    return res.status(503).json({ status: 'error', message: err.message });
  }
});

const PORT = process.env.PORT || 5000
console.log(process.env.PORT, "Server starting...")
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app