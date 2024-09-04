import { Schema, model, Document } from 'mongoose';

export interface TokenBlacklistDocument extends Document {
    token: string;
}

const tokenBlacklistSchema = new Schema<TokenBlacklistDocument>({
    token: { type: String, required: true },
});

export default model<TokenBlacklistDocument>(
    'TokenBlacklist',
    tokenBlacklistSchema
);
