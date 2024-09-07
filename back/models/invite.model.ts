import { Schema, model, Document } from 'mongoose';

type TInviteResolution = 'accept' | 'decline' | null;
export interface InviteDocument extends Document {
    sender: string;
    recipient: string;
    team: string;
    token: string;
    expires: Date;
    seen: boolean;
    resolution: TInviteResolution;
}

const inviteSchema = new Schema<InviteDocument>({
    sender: { type: String, required: true },
    recipient: { type: String, required: true },
    team: { type: String, required: true },
    token: { type: String, required: true },
    expires: { type: Date, required: true },
    seen: { type: Boolean, default: false },
    resolution: {
        type: String,
        enum: ['accept', 'decline', null],
        default: null,
    },
});

export default model<InviteDocument>('Invite', inviteSchema);
