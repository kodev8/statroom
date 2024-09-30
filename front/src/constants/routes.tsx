const baseRoutes = {
    // auth routes
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    githubSuccess: '/github-success',

    // public routes - base routes
    home: '/',
    contact: '/contact',
    about: '/about',
    plans: '/plans/:slug',

    // app routes
    // account routes
    account: '/account',
    accountSecurity: '/account/security',
    accountBilling: '/account/billing',
    accountNotifications: '/account/notifications',
    accountIntegration: '/account/integration',

    // dashboard routes
    dashboard: '/dashboard',
    projects: '/dashboard/projects',
    teams: '/dashboard/teams',

    teamInvites: '/teams/invites',
};

export default baseRoutes;
