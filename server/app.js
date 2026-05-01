import 'dotenv/config'   // ✅ MUST BE FIRST LINE

import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import passport from './config/passport.js'
import authRoutes from './routes/auth.routes.js'
import connectDB from './config/db.js'

connectDB()
const app = express()

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api/auth', authRoutes)

const PORT = process.env.PORT || 5000
console.log(process.env.PORT, "Server starting...")
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

export default app