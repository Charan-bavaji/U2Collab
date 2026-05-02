import { useEffect, useState } from 'react'
import { useSocket } from './useSocket'

export const usePresence = (roomId) => {
  const socket = useSocket()
  const [users, setUsers] = useState([])

  useEffect(() => {
    if (!roomId) return
    socket.emit('room:join', { roomId })
    socket.on('presence:update', ({ users }) => setUsers(users))

    return () => {
      socket.emit('room:leave')
      socket.off('presence:update')
    }
  }, [roomId])

  return users
}