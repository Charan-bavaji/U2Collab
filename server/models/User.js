import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String },
    avatar: { type: String },
    provider: { type: String, required: true },   // 'google' | 'github'
    providerId: { type: String, required: true },
}, { timestamps: true })

userSchema.index({ provider: 1, providerId: 1 }, { unique: true })

export default mongoose.model('User', userSchema)