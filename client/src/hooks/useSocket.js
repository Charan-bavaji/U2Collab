import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

let socket = null   // singleton — one connection per app session

export const useSocket = () => {
  if (!socket) {
    socket = io('http://localhost:5000', { withCredentials: true })
  }
  return socket
}