import Room from '../models/Room.js'

// in-memory:  roomId → Map<shapeId, shape>
const boards = new Map()

const getBoard = (roomId) => {
  if (!boards.has(roomId)) boards.set(roomId, new Map())
  return boards.get(roomId)
}

// debounce timers
const saveTimers = new Map()

const scheduleFlush = (roomId) => {
  if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId))
  saveTimers.set(roomId, setTimeout(async () => {
    const board   = getBoard(roomId)
    const shapes  = JSON.stringify([...board.values()])
    await Room.findByIdAndUpdate(roomId, { whiteboard: shapes })
    saveTimers.delete(roomId)
  }, 5000))
}

const applyOp = (board, op) => {
  switch (op.type) {
    case 'add':    board.set(op.shape.id, op.shape);           break
    case 'move':   
    case 'update':
      if (board.has(op.id)) {
        board.set(op.id, { ...board.get(op.id), ...op.props })
      }
      break
    case 'delete': board.delete(op.id);                        break
    case 'clear':  board.clear();                              break
  }
}

export default (io, socket) => {

  socket.on('whiteboard:join', async ({ roomId }) => {
    const board = getBoard(roomId)

    // seed from MongoDB if board is empty (first user)
    if (board.size === 0) {
      const room = await Room.findById(roomId).select('whiteboard')
      if (room?.whiteboard) {
        const shapes = JSON.parse(room.whiteboard)
        shapes.forEach(s => board.set(s.id, s))
      }
    }

    // send full board state to joining client
    socket.emit('whiteboard:init', { shapes: [...board.values()] })
  })

  socket.on('whiteboard:op', ({ roomId, op }) => {
    const board = getBoard(roomId)
    applyOp(board, op)
    socket.to(roomId).emit('whiteboard:op', { op })   // broadcast to others
    scheduleFlush(roomId)
  })
}