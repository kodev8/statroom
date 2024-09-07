import mongoose, { Schema, Document } from 'mongoose';
import { ISubscription } from '#/types/subscription';

export interface ISubscriptionDocument extends ISubscription, Document {}

const SubscriptionSchema = new Schema<ISubscriptionDocument>({
    slug: { type: String, required: true, unique: true },
    target: { type: String, required: true },
    short_description: { type: String, required: true },
    long_description: { type: String, required: true },
    plans: [
        {
            title: { type: String, required: true },
            reason: { type: String, required: true },
            month_price: { type: Number, required: true },
            annual_price: { type: Number },
            features: { type: [String], required: true },
            popularity: { type: String, default: 'default', required: false },
            team_size: { type: Number },
            require_setup: { type: Boolean },
            hidden_fees: { type: Boolean },
            individual_configuration: { type: Boolean },
            team_configuration: { type: Boolean },
            team_size_configuration: { type: Boolean },
            team_size_limit: { type: Number },
            included_future_updates: { type: Boolean },
            api_access: { type: Boolean },
            api_requests_hourly_limit: { type: Number },
            support: { type: Boolean },
            premium_support: { type: Boolean },
        },
    ],
});

export default mongoose.model<ISubscriptionDocument>(
    'Subscription',
    SubscriptionSchema
);
