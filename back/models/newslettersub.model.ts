import { Schema, model, Document } from 'mongoose';

export interface INewsletterSub extends Document {
    email: string;
}

const NewsletterSubSchema = new Schema({
    email: { type: String, required: true },
});

export default model<INewsletterSub>('NewsletterSub', NewsletterSubSchema);
