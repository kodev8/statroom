import SheetNavigation from './SheetNavigation';
import { NavLink } from 'react-router-dom';
import ProfileDropdown from '@/components/ProfileDropdown';
import { StatRoomLogo } from './Icons';
import baseRoutes from '@/constants/routes';
export default function UserNavbar() {
    return (
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <NavLink
                    to={baseRoutes.home}
                    className="flex items-center gap-2 text-lg font-semibold md:text-base"
                >
                    <StatRoomLogo height={30} width={30} asIcon />
                    <span className="sr-only">StatRoom</span>
                </NavLink>
                <NavLink
                    to={baseRoutes.dashboard}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                >
                    Dashboard
                </NavLink>

                <NavLink
                    to={baseRoutes.projects}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                >
                    Projects
                </NavLink>
                <NavLink
                    to={baseRoutes.teams}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                >
                    Teams
                </NavLink>
            </nav>
            <SheetNavigation />
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                <ProfileDropdown className="ml-auto" />
            </div>
        </header>
    );
}
