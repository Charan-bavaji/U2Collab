import express from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
    createRoom, getMyRooms, getRoom,
    updateRoom, deleteRoom, joinByInvite, getRoomMessages
} from '../controllers/roomController.js'

const router = express.Router()
router.use(protect)

router.post('/', createRoom)
router.get('/', getMyRooms)
router.get('/:id', getRoom)
router.patch('/:id', updateRoom)
router.delete('/:id', deleteRoom)
router.post('/join/:code', joinByInvite)
router.get('/:id/messages', getRoomMessages)

export default router