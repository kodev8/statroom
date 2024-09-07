import mongoose, { Schema, Document } from 'mongoose';

export interface IConactMessage extends Document {
    name: string;
    email: string;
    message: string;
}

const contactMessageSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
});

export const ContactMessage = mongoose.model<IConactMessage>(
    'ContactMessage',
    contactMessageSchema
);
