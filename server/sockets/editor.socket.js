import * as Y from 'yjs'
import * as syncProtocol from 'y-protocols/sync'
import * as encoding from 'lib0/encoding'
import * as decoding from 'lib0/decoding'
import Room from '../models/Room.js'

// in-memory store:  roomId → Y.Doc
const docs = new Map()

export const getOrCreateDoc = (roomId) => {
    if (!docs.has(roomId)) docs.set(roomId, new Y.Doc())
    return docs.get(roomId)
}

// debounce timers for MongoDB snapshots
const saveTimers = new Map()

const scheduleSnapshot = (roomId, doc) => {
    if (saveTimers.has(roomId)) clearTimeout(saveTimers.get(roomId))
    saveTimers.set(roomId, setTimeout(async () => {
        const content = doc.getText('content').toString()
        await Room.findByIdAndUpdate(roomId, { content })
        saveTimers.delete(roomId)
    }, 3000))   // save 3s after last change
}

export default (io, socket) => {
    socket.on('editor:join', async ({ roomId }) => {
        const doc = getOrCreateDoc(roomId)

        // send the full current doc state to the joining client
        const encoder = encoding.createEncoder()
        syncProtocol.writeSyncStep1(encoder, doc)
        socket.emit('editor:sync', encoding.toUint8Array(encoder))

        // seed from MongoDB if doc is empty (first user in room)
        if (doc.getText('content').length === 0) {
            const room = await Room.findById(roomId).select('content')
            if (room?.content) {
                doc.getText('content').insert(0, room.content)
            }
        }
    })

    socket.on('editor:update', ({ roomId, update }) => {
        const doc = getOrCreateDoc(roomId)
        const uint8 = new Uint8Array(update)

        // apply the update to server doc
        Y.applyUpdate(doc, uint8, socket)

        // broadcast to everyone else in the room
        socket.to(roomId).emit('editor:update', { update })

        // schedule a MongoDB snapshot
        scheduleSnapshot(roomId, doc)
    })
}