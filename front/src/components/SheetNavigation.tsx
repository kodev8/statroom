import { PanelLeft, Home, Users2, LineChart, FolderGit } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatRoomLogo } from '@/components/Icons';
import { NavLink } from 'react-router-dom';

function SheetNavigation() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <NavLink
                        to="#"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                        <StatRoomLogo height={30} width={30} asIcon />
                        <span className="sr-only">StatRoom</span>
                    </NavLink>
                    <NavLink
                        to="#"
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <Home className="h-5 w-5" />
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/dashboard/projects"
                        className="flex items-center gap-4 px-2.5 text-foreground"
                    >
                        <FolderGit className="h-5 w-5" />
                        Projects
                    </NavLink>
                    <NavLink
                        to="/dashboard/teams"
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <Users2 className="h-5 w-5" />
                        Teams
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                    >
                        <LineChart className="h-5 w-5" />
                        Settings
                    </NavLink>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

export default SheetNavigation;
