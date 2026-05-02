import { useEffect, useRef } from 'react'
import * as Y from 'yjs'
import { useSocket } from './useSocket'

export const useYjs = (roomId) => {
  const socket  = useSocket()
  const docRef  = useRef(null)

  if (!docRef.current) docRef.current = new Y.Doc()
  const doc = docRef.current

  useEffect(() => {
    if (!roomId) return

    // tell server we're joining the editor
    socket.emit('editor:join', { roomId })

    // receive full doc state on join
    socket.on('editor:sync', (update) => {
      Y.applyUpdate(doc, new Uint8Array(update))
    })

    // receive incremental updates from other users
    socket.on('editor:update', ({ update }) => {
      Y.applyUpdate(doc, new Uint8Array(update))
    })

    // send our local changes to server
const onUpdate = (update, origin) => {
  if (origin === socket) return   // don't echo back updates we received
  socket.emit('editor:update', {
    roomId,
    update: Array.from(update),
  })
}

doc.on('update', onUpdate)

    return () => {
      doc.off('update', onUpdate)
      socket.off('editor:sync')
      socket.off('editor:update')
    }
  }, [roomId])

  return doc
}