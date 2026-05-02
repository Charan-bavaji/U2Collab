import mongoose from 'mongoose'

const snapshotSchema = new mongoose.Schema({
  room:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  content: { type: String, required: true },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

export default mongoose.model('Snapshot', snapshotSchema)