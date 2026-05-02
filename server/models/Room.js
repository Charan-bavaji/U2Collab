import mongoose from 'mongoose'
import { nanoid } from 'nanoid'

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  inviteCode: { type: String, default: () => nanoid(8), unique: true },
  content: { type: String, default: '' },      // latest editor snapshot
  lastVisited: { type: Map, of: Date },            // userId → last open time
  whiteboard: { type: String, default: '[]' },
}, { timestamps: true })

export default mongoose.model('Room', roomSchema)