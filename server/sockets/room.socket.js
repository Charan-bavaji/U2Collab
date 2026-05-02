import Room from '../models/Room.js'
import Message from '../models/Message.js'
// track online users per room  { roomId → Map<userId, userInfo> }
const onlineRooms = new Map()

export default (io, socket) => {
  const user = socket.user

  // ── join room ──────────────────────────────────────────
  socket.on('room:join', async ({ roomId }) => {
    const room = await Room.findById(roomId)
    if (!room) return socket.emit('error', 'Room not found')

    const isMember = room.members.some(m => m.toString() === user.id)
    if (!isMember) return socket.emit('error', 'Access denied')

    socket.join(roomId)
    socket.currentRoom = roomId

    // track presence
    if (!onlineRooms.has(roomId)) onlineRooms.set(roomId, new Map())
    onlineRooms.get(roomId).set(user.id, {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
    })

    // broadcast updated presence to everyone in room
    io.to(roomId).emit('presence:update', {
      users: [...onlineRooms.get(roomId).values()]
    })
  })

  // ── leave / disconnect ─────────────────────────────────
  const handleLeave = (roomId) => {
    if (!roomId) return
    socket.leave(roomId)
    const room = onlineRooms.get(roomId)
    if (room) {
      room.delete(user.id)
      if (room.size === 0) onlineRooms.delete(roomId)
      else io.to(roomId).emit('presence:update', { users: [...room.values()] })
    }
  }

  socket.on('room:leave', () => handleLeave(socket.currentRoom))
  socket.on('disconnect', () => handleLeave(socket.currentRoom))

  // ── chat ───────────────────────────────────────────────
  socket.on('chat:send', async ({ roomId, text }) => {
    if (!text?.trim()) return
    const msg = await Message.create({
      room: roomId,
      sender: user.id,
      text: text.trim(),
    })
    await msg.populate('sender', 'name avatar')

    io.to(roomId).emit('chat:message', {
      _id: msg._id,
      sender: msg.sender,
      text: msg.text,
      createdAt: msg.createdAt,
    })
  })

  // ── editor (Yjs updates — Phase 3) ────────────────────
  socket.on('editor:update', ({ roomId, update }) => {
    socket.to(roomId).emit('editor:update', { update })
  })

  // ── whiteboard (Phase 4) ──────────────────────────────
  socket.on('whiteboard:draw', ({ roomId, op }) => {
    socket.to(roomId).emit('whiteboard:draw', { op })
  })

  // ── typing indicator (bonus) ───────────────────────────
  socket.on('chat:typing', ({ roomId, name }) => {
    socket.to(roomId).emit('chat:typing', { name })
  })
}