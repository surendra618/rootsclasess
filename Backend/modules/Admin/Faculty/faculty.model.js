import mongoose from "mongoose";

const facultySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 5
    },
    experience: {
        type: String,
        default: '5+'
    }
}, { timestamps: true });

export const Faculty = mongoose.model('Faculty', facultySchema);
