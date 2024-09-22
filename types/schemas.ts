import { MAX_CONTACT_MESSAGE_LENGTH } from '../shared/constants';
import { z, ZodRawShape, ZodObject, ZodEffects, ZodOptional } from 'zod';

export const generateDefaultValuesFromSchema = (zodObj: ZodObject<ZodRawShape> | ZodEffects<ZodObject<ZodRawShape>>) => {
    const defaultValues: any = {};

    const schema = zodObj instanceof ZodEffects  ? zodObj._def.schema : zodObj;
    
    for (const key in schema.shape) {
        let field = schema.shape[key as keyof typeof schema.shape];
        // Unwrap if the field is a ZodEffect (refinements, transformations, etc.)
        while (field instanceof ZodEffects) {
            field = field._def.schema;
        }

        while (field instanceof ZodOptional) {
            field = field._def.innerType;
        }

        if (!field) continue;

        // Check the type and generate default values accordingly
        if (field._def.typeName === 'ZodString') {
            defaultValues[key] = '';
        } else if (field._def.typeName === 'ZodNumber') {
            defaultValues[key] = 0;
        } else if (field._def.typeName === 'ZodBoolean') {
            defaultValues[key] = false;
        } else if (field._def.typeName === 'ZodArray') {
            defaultValues[key] = [];
        } else if (field._def.typeName === 'ZodObject') {
            defaultValues[key] = generateDefaultValuesFromSchema(field as ZodObject<ZodRawShape>);
        }
    }
    
    return defaultValues;
};

function toTitleCase(str: string) {
    return str.replace(
      /\w\S*/g,
      text => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
}
  
function findDuplicates (arr: string[]) {
    return arr.filter((item, index) => arr.indexOf(item) !== index)
}

function preprocessName (data: unknown) {
    if (!data || typeof data !== 'string') return '';
    return toTitleCase(data).trim();
}

const email = z.string().toLowerCase().email({ message: 'Invalid email address' });
const passwordSet = z.string().regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]).{8,}$/,
    { message: 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character' });
const confirmPassword = z.string();

export const nameStrict = z.preprocess(preprocessName, z.string().regex(/^[-a-zA-Z\s]+$/, { message: 'Name must contain only letters' }));
export const nameAllow = z.preprocess(preprocessName, z.string().regex(/^[-a-zA-Z0-9\s]*$/, { message: 'Name must contain only letters, numbers and hyphens' }));

const tags = z.preprocess((data) => {
    if (!data) return [];
    if (typeof data === 'string') return data.split(',').map(tag => tag.trim().replace(/[^a-zA-Z0-9]/g, ''));
    if (Array.isArray(data)) return data.map(tag => tag.trim().replace(/[^a-zA-Z0-9]/g, ''));
    return [];
}, z.array(z.string()).optional().refine(data => data && data.length <= 5, {
    message: 'Only 5 tags are allowed',
}).refine(data => {
    if (data) {
        return data.every(tag => (tag.length <= 20 && tag.length > 0));
    } else {
        return true;
    }
}, {
    message: 'Tags must be less than 20 characters long and at least one character',
}).refine(data => data && !findDuplicates(data).length, {
    message: 'Duplicate tags are not allowed'
}
)
);
  
const VIDEO_FILE_TYPES = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm',]
const IMAGE_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 1024 * 1024 * 1024 * 2; // 2GB
const MAX_DURATION = 60 * 60 * 2; // 2 hours

const video = z.any()
    .refine(data => data?.video?.size <= MAX_FILE_SIZE, {
    message: 'File size must be less than 2GB',
}).refine(data => data?.video && VIDEO_FILE_TYPES.includes(data.video.type), {
    message: 'Invalid file type',
}).refine(data => data?.duration <= MAX_DURATION, {
    message: 'Video duration must be less than 2 hours',
}).optional();

const image = z.any()
    .refine(data => data?.size <= MAX_FILE_SIZE, {  
    message: 'File size must be less than 2GB',
}).refine(data => data?.type && IMAGE_FILE_TYPES.includes(data.type), {
    message: 'Invalid file type',
}).optional();



// ----------------------- AUTH SCHEMAS -------------------

export const emailSchema = z.object({ 
    email 
});
const authBaseSchema = emailSchema.extend({
    password: z.string().min(1, { message: 'Password is required' })
});

const passwordBaseSchema = z.object({
    password: passwordSet,
    confirmPassword
})

export const loginSchema = authBaseSchema
export const registerSchema = z.object({
    fname: nameStrict,
    lname: nameStrict,
})
    .merge(emailSchema)
    .merge(passwordBaseSchema)
    .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

export const resetPasswordAnonSchema = emailSchema.merge(passwordBaseSchema).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});

export const resetPasswordAuthSchema = passwordBaseSchema.extend({
    oldPassword: z.string().min(1, { message: 'Old password is required' })
}).refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']   
});


export const otpSchema = z.object({
    otp: z.string().length(6, { message: 'OTP must be 6 characters long' })
}).merge(emailSchema);  



// ------------------ PROJECT SCHEMAS ------------------

export const userProjectRolesSchema = z.object({
    email,
    role: z.enum(['owner', 'viewer', 'editor']),
});

export const categories: [string, ...string[]]= [
    "senior",
    "junior",
    "youth",
    "u23",
    "u21",
    "u20",
    "u19",
    "u18",
    "u17",
    "other"
]

export const leagues: [string, ...string[]] = [
    "professional",
    "deparmental",
    "regional",
    "other"
]

export const projectSchema = z.object({
    name: nameStrict,
    // status: z.enum(['active', 'archived', 'processing']),
    description: z.string().min(2, { message: 'Description must be at least 2 characters long' }),
    sport: z.enum(['football', 'other']),
    league: z.enum(leagues),
    category: z.enum(categories),
    tags,
    team: nameAllow.optional(),
    thumbnail: z.string().optional().or(image),
});

export const editProjectSchema = projectSchema.extend({
    status: z.enum(['active', 'archived', 'processing']).optional(),
    latestTag: z.string().optional()
});

export const folderSchema = z.object({
    name: nameAllow,
});

export const AIRequestSchema = z.object({
    model: z.enum([
        'player_detection', 
        'ball_detection', 
        'player_tracking', 
        'team_classification', 
        'radar'
    ]).optional(),
    file: video.optional(),
    prompt: z.string()
        .max(1000, {
            message: 'Prompt must be less than 1000 characters long'
        })
        .optional(),
    video_id: z.string().optional(),
}).refine(
    (data) => {
        if (data.file && data.model) {
            return true;
        }
        
        if (!data.file && data.prompt && data.video_id) {
            return true
        }
        
        return false;
    },
    {
        message: "Either provide a file, or both prompt and videoIds"
    }
);
    // modelRole: z.enum(['coach', 'player', 'educator', 'sports better']),
    // refinePrompt: z.string().max(300, {
    //     message: 'Prompt to refine your model must be less than 300 characters long'
    // }).optional(),



// ------------ TEAM SCHEMAS ------------
export const createTeamSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    description: z.string().min(2, { message: 'Description must be at least 2 characters long' }),
    picture: z.string().optional(),
});

export const updateTeamSchema = createTeamSchema.omit({ name: true }).extend({
    members: z.array(emailSchema)
});

export const teamSchema = z.object({
    name: nameStrict,
    description: z.string().min(2, { message: 'Description must be at least 2 characters long' }),
    picture: z.string().optional(),
});


// ------------------ ACCOUNT SCHEMAS ------------------
export const updateAccountSchema = z.object({
    fname: nameStrict,
    lname: nameStrict,
});

export const handleTwoFactorSchema = z.object({
    twoFactorEnabled: z.boolean()
});

export const notificationsSchema = z.object({
    notifications: z.enum(['all', 'none', 'important'])
});

export const cardPaymentSchema = z.object({
    number: z.string().length(16, { message: 'Card number must be at least 16 characters long' }).regex(/^\d+$/, { message: 'Card number must be a number' }),
    expiry: z.string().regex(/^\d{2}\/\d{2}$/, { message: 'Expiry must be in the format MM/YY' }),
    cvv: z.string().regex(/^\d{3$/, { message: 'CVV must be a number' }),
    name: nameStrict,
});

export const paymentSchema = z.discriminatedUnion('paymentMethod', [
    z.object({
        paymentMethod: z.literal('card'),
        card: cardPaymentSchema
    }),
    z.object({
        paymentMethod: z.literal('paypal'),
        email: emailSchema
    }),
    z.object({
        paymentMethod: z.literal('applepay'),
        token: z.string().length(12, { message: 'Token must be 16 characters long' })
    })
]);




// ------------------ etc ----------------
export const contactSchema = emailSchema.extend({
    name: nameStrict,
    message: z.string().trim()
        .min(1, { message: 'Message is required' })
        .max(MAX_CONTACT_MESSAGE_LENGTH, { message: 'Message must be less than 500 characters' })
});


// -----------------------
// TYPES
// --------------------------


export type TEmailSchema = z.infer<typeof emailSchema>;
export type TLoginSchema = z.infer<typeof loginSchema>;
export type TRegisterSchema = z.infer<typeof registerSchema>;
export type TResetPasswordAnonSchema = z.infer<typeof resetPasswordAnonSchema>;
export type TContactSchema = z.infer<typeof contactSchema>;
export type TProjectSchema = z.infer<typeof projectSchema>;
export type TUserProjectRolesSchema = z.infer<typeof userProjectRolesSchema>;
export type TResetPasswordAuthSchema = z.infer<typeof resetPasswordAuthSchema>;
export type TTeamSchema = z.infer<typeof teamSchema>;
export type TEditProjectSchema = z.infer<typeof editProjectSchema>;
export type TCardPaymentSchema = z.infer<typeof cardPaymentSchema>;
export type TPaymentSchema = z.infer<typeof paymentSchema>;
export type TOtpSchema = z.infer<typeof otpSchema>;
export type TUpdateAccountSchema = z.infer<typeof updateAccountSchema>;
export type TNotificationSchema = z.infer<typeof notificationsSchema>;
export type TFoldersSchema = z.infer<typeof folderSchema>;  
export type TAIRequestSchema = z.infer<typeof AIRequestSchema>;
export type THandleTwoFactorSchema = z.infer<typeof handleTwoFactorSchema>;








