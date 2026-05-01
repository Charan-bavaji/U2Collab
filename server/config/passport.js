
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import User from '../models/User.js'

const findOrCreate = async (provider, providerId, profile) => {
  let user = await User.findOne({ provider, providerId })
  if (!user) {
    user = await User.create({
      provider,
      providerId,
      name: profile.displayName || profile.username,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
    })
  }
  return user
}

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (_at, _rt, profile, done) => {
  try {
    const user = await findOrCreate('google', profile.id, profile)
    done(null, user)
  } catch (err) { done(err) }
}))

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback',
  scope: ['user:email'],
}, async (_at, _rt, profile, done) => {
  try {
    const user = await findOrCreate('github', profile.id, profile)
    done(null, user)
  } catch (err) { done(err) }
}))

export default passport