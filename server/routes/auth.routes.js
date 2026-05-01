import express from 'express'
import passport from '../config/passport.js'
import { signToken, setCookie } from '../utils/jwt.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const oauthCallback = (req, res) => {
  const token = signToken(req.user)
  setCookie(res, token)
  res.redirect(`${process.env.CLIENT_URL}/dashboard`)
}

// Google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }))
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=true` }),
  oauthCallback)

// GitHub
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false }))
router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=true` }),
  oauthCallback)

// Me (used by React to hydrate AuthContext on page load)
router.get('/me', protect, (req, res) => res.json(req.user))

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('u2collab_token')
  res.json({ message: 'Logged out' })
})

export default router