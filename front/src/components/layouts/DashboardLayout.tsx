import { NavLink, Outlet, useMatches, Link } from 'react-router-dom';
import { Home, FolderGit,Settings, Users2 } from 'lucide-react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import SheetNavigation from '../SheetNavigation';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from '@/components/ui/tooltip';
import ProfileDropdown from '@/components/ProfileDropdown';
import { StatRoomLogo } from '../Icons';
import { Fragment } from 'react/jsx-runtime';
import { cn } from '@/lib/utils';
import baseRoutes from '@/constants/routes';
import { useCrumb } from '@/components/hooks/useCrumb';
import SearchBar from '@/components/SearchBar';
type DashboardHandle = {
    crumb?: {
        label: string;
        type: 'page' | 'link';
    };
};

function DashboardLayout() {
    let crumbs = useMatches()
        .filter((match) => (match.handle as DashboardHandle)?.crumb)
        .map((match) => {
            const crumb = (match.handle as DashboardHandle)?.crumb;
            return {
                to: match.pathname,
                label: crumb?.label,
                type: crumb?.type,
            };
        });

    const { redirect, crumbLabel } = useCrumb();
    if (crumbLabel) {
        crumbs = [...crumbs, { to: redirect, label: crumbLabel, type: 'page' }];
    }

    return (
        <div className="flex h-full w-full flex-col bg-muted/40 dark:bg-black">
            <aside className="z-[500] fixed inset-y-0 left-0 hidden w-14 flex-col border-r bg-background sm:flex">
                <nav className="flex flex-col items-center gap-4 px-2 py-4">
                    <Link to={baseRoutes.home}>
                        <StatRoomLogo height={30} width={30} asIcon />
                    </Link>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <NavLink
                                        to={baseRoutes.dashboard}
                                        end
                                        className={({ isActive }) =>
                                            cn(
                                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8 z-20',
                                                {
                                                    'bg-accent text-accent-foreground':
                                                        isActive,
                                                    'text-muted-foreground':
                                                        !isActive,
                                                }
                                            )
                                        }
                                    >
                                        <Home className="h-5 w-5" />
                                        <span className="sr-only">
                                            Dashboard
                                        </span>
                                    </NavLink>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Dashboard
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <NavLink
                                        to={baseRoutes.projects}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
                                                {
                                                    'bg-accent text-accent-foreground':
                                                        isActive,
                                                    'text-muted-foreground':
                                                        !isActive,
                                                }
                                            )
                                        }
                                    >
                                        <FolderGit className="h-5 w-5" />
                                        <span className="sr-only">
                                            Projects
                                        </span>
                                    </NavLink>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Projects
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <NavLink
                                        to={baseRoutes.teams}
                                        className={({ isActive }) =>
                                            cn(
                                                'flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:text-foreground md:h-8 md:w-8',
                                                {
                                                    'bg-accent text-accent-foreground':
                                                        isActive,
                                                    'text-muted-foreground':
                                                        !isActive,
                                                }
                                            )
                                        }
                                    >
                                        <Users2 className="h-5 w-5" />
                                        <span className="sr-only">Teams</span>
                                    </NavLink>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">Teams</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavLink
                                    to="#"
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    <LineChart className="h-5 w-5" />
                                    <span className="sr-only">Analytics</span>
                                </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Analytics
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider> */}
                </nav>
                <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <NavLink
                                    to={baseRoutes.account}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                                >
                                    <Settings className="h-5 w-5" />
                                    <span className="sr-only">Settings</span>
                                </NavLink>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                Settings
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </nav>
            </aside>
            <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 dark:bg-black h-full">
                <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
                    <SheetNavigation />
                    <Breadcrumb className="hidden md:flex">
                        <BreadcrumbList>
                            {crumbs.map((crumb, index) => (
                                <Fragment key={crumb.label}>
                                    <BreadcrumbItem>
                                        <BreadcrumbLink asChild>
                                            {crumb.type === 'page' ? (
                                                <BreadcrumbPage>
                                                    {crumb.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <NavLink to={crumb.to}>
                                                    {crumb.label}
                                                </NavLink>
                                            )}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    {index < crumbs.length - 1 && (
                                        <BreadcrumbSeparator />
                                    )}
                                </Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                    <SearchBar />
                    <ProfileDropdown />
                </header>
                <Outlet />
            </div>
        </div>
    );
}

export default DashboardLayout;
