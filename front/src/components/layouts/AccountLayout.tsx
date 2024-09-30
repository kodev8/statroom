import UserNavbar from '../UserNavbar';
import { Outlet, NavLink, useMatches, useLocation } from 'react-router-dom';

interface UserMatch {
    handle?: {
        title: string;
    };
    pathname: string;
}
import { cn } from '@/lib/utils';

function UserLayout() {
    const matches = useMatches();
    const location = useLocation();

    const match = matches.filter(
        (match) => match.handle && match.pathname === location.pathname
    );
    const title = (match[0] as UserMatch)?.handle?.title;

    return (
        <div className="flex min-h-screen w-full flex-col">
            <UserNavbar />
            <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 bg-muted/40 p-4 md:gap-8 md:p-10">
                <div className="mx-auto grid w-full max-w-6xl gap-2">
                    <h1 className="text-3xl font-semibold">
                        {title ?? 'Your Account'}
                    </h1>
                </div>
                <div className="mx-auto grid w-full max-w-6xl items-start gap-6 md:grid-cols-[180px_1fr] lg:grid-cols-[250px_1fr]">
                    <nav className="grid grid-cols-2 md:grid-cols-1 gap-4 text-sm text-muted-foreground">
                        <NavLink
                            to="/account"
                            end
                            className={({ isActive }) =>
                                cn({
                                    'font-semibold text-primary': isActive,
                                })
                            }
                        >
                            General
                        </NavLink>
                        <NavLink
                            to="/account/security"
                            className={({ isActive }) =>
                                cn({
                                    'font-semibold text-primary': isActive,
                                })
                            }
                        >
                            Security
                        </NavLink>
                        <NavLink
                            to="/account/integrations"
                            className={({ isActive }) =>
                                cn({
                                    'font-semibold text-primary': isActive,
                                })
                            }
                        >
                            Integrations
                        </NavLink>
                        <NavLink
                            to="/account/notifications"
                            className={({ isActive }) =>
                                cn({
                                    'font-semibold text-primary': isActive,
                                })
                            }
                        >
                            Notifications
                        </NavLink>
                        <NavLink
                            to="/account/billing"
                            className={({ isActive }) =>
                                cn({
                                    'font-semibold text-primary': isActive,
                                })
                            }
                        >
                            Billing
                        </NavLink>
                        <NavLink
                            to="/account/preferences"
                            className={({ isActive }) =>
                                cn({
                                    'font-semibold text-primary': isActive,
                                })
                            }
                        >
                            Preferences
                        </NavLink>
                    </nav>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default UserLayout;
