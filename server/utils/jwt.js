import jwt from 'jsonwebtoken'

export const signToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, avatar: user.avatar },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

export const setCookie = (res, token) =>
  res.cookie('u2collab_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,   // 7 days in ms
  })