import mongoose from 'mongoose';

// GameSession Schema
const gameSessionSchema = new mongoose.Schema(
    {
        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Room',
            required: true,
        },
        teacherId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        sessionToken: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        roomStatus: {
            type: String,
            enum: ['waiting', 'in_progress', 'completed'],
            default: 'waiting',
        },
        deviceInfo: {
            type: Object,
            default: {},
            // Example: { deviceType: 'mobile', os: 'Android', browser: 'Chrome', ip: '...' }
        },
        lastActiveAt: {
            type: Date,
            default: Date.now,
        },
        reconnectAttempts: {
            type: Number,
            default: 0,
        },
        connectionStatus: {
            type: String,
            enum: ['connected', 'disconnected', 'reconnecting'],
            default: 'connected',
        },
        lastKnownState: {
            type: Object,
            default: {},
            // Can store last game state for reconnect
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
