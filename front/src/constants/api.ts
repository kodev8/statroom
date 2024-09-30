const authRoutes = {
    login: '/auth/login',
    register: '/auth/register',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    resetPasswordAnon: '/auth/reset-password-anon',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
    me: '/auth/me',

    // OTP
    verifyOTP: '/auth/verify-otp',
    sendOTP: '/auth/send-otp',
    sendOTP2FA: '/auth/send-otp-2fa',
    verifyUser: '/auth/verify-user',

    // OAuth
    google: '/auth/oauth/google',
    github: '/auth/oauth/github',
};

const accountRoutes = {
    account: '/account',
    updateEmail: '/account/update-email',
    updateAccount: '/account',
    enable2fa: '/account/manage-2fa',
    updateNotificationSettings: '/account/notification-settings',
    changePassword: '/account/change-password',
    delete: '/account/delete',
};

const auxRoutes = {
    plans: '/api/plans',
    plan: '/api/plans/:slug',
    contact: '/api/contact-us',
    subscribeToNewsletter: '/api/newsletter',
    unsubscribeFromNewsletter: '/api/newsletter',
};

const api = {
    auth: authRoutes,
    account: accountRoutes,
    aux: auxRoutes,
};

export default api;
