import Room    from '../models/Room.js'
import Message from '../models/Message.js'

export const createRoom = async (req, res) => {
  const room = await Room.create({
    name:    req.body.name,
    owner:   req.user._id,
    members: [req.user._id],
  })
  res.status(201).json(room)
}

export const getMyRooms = async (req, res) => {
  const rooms = await Room.find({ members: req.user._id })
    .populate('owner', 'name avatar')
    .populate('members', 'name avatar')
    .sort({ updatedAt: -1 })
  
  const userId = req.user._id.toString()

  const withMeta = rooms.map(r => ({
    ...r.toObject(),
    isOwner:     r.owner._id.toString() === userId,
    lastVisited: r.lastVisited?.get(userId) ?? null,
  }))

  res.json(withMeta)
}

export const getRoom = async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('owner',   'name avatar')
    .populate('members', 'name avatar')

  if (!room) return res.status(404).json({ message: 'Room not found' })

  const isMember = room.members.some(m => m._id.equals(req.user._id))
  if (!isMember) return res.status(403).json({ message: 'Access denied' })

  // track last visited
  room.lastVisited = room.lastVisited || new Map()
  room.lastVisited.set(req.user._id.toString(), new Date())
  await room.save()

  res.json(room)
}

export const updateRoom = async (req, res) => {
  const room = await Room.findById(req.params.id)
  if (!room) return res.status(404).json({ message: 'Not found' })
  if (!room.owner.equals(req.user._id))
    return res.status(403).json({ message: 'Owner only' })

  if (req.body.name) room.name = req.body.name
  await room.save()
  res.json(room)
}

export const deleteRoom = async (req, res) => {
  const room = await Room.findById(req.params.id)
  if (!room) return res.status(404).json({ message: 'Not found' })
  if (!room.owner.equals(req.user._id))
    return res.status(403).json({ message: 'Owner only' })

  await room.deleteOne()
  res.json({ message: 'Deleted' })
}

export const joinByInvite = async (req, res) => {
  const room = await Room.findOne({ inviteCode: req.params.code })
  if (!room) return res.status(404).json({ message: 'Invalid invite link' })

  const already = room.members.some(m => m.equals(req.user._id))
  if (!already) {
    room.members.push(req.user._id)
    await room.save()
  }

  res.json({ roomId: room._id })   // client redirects to /room/:id
}

export const getRoomMessages = async (req, res) => {
  const messages = await Message.find({ room: req.params.id })
    .populate('sender', 'name avatar')
    .sort({ createdAt: 1 })
    .limit(100)
  res.json(messages)
}