import mongoose, { Schema } from 'mongoose';

const NotificationSchema = new Schema(
    {
        sender: {
            type: String,
            required: true,
        },

        recipient: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: [true, 'notification_type is required'],
            enum: [
                'team_access_request',
                'team_access_response',
                'update_team_member_role',
            ],
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        seen: {
            type: Boolean,
            default: false,
        },
        category: {
            type: String,
            required: true,
            enum: [
                'team',
                'billing',
                'notifications',
                'integrations',
                'preferences',
                'project',
            ],
        },
        subcategory: {
            type: String,
            required: true,
            enum: ['info', 'warning', 'error'],
        },
        resolution: {
            type: String,
            required: true,
            enum: ['pending', 'approved', 'rejected', 'deleted'],
            default: 'pending',
        },
        data: {
            type: Object,
            required: false,
        },
    },

    {
        timestamps: {
            createdAt: 'createdAt',
        },
        toJSON: {
            transform: function (_doc, ret): Record<string, any> {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
                return ret;
            },
        },
    }
);

export default mongoose.model('Notification', NotificationSchema);
