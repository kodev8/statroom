import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetClose,
} from '@/components/ui/sheet';
import { Button, buttonVariants } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { StatRoomLogo, MenuIcon } from '@/components/Icons';
import { Separator } from '@/components/ui/separator';
import {
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuContent,
    NavigationMenuTrigger,
    NavigationMenuLink,
} from '@/components/ui/navigation-menu';
import { ListItem } from '@/components/ui/list-item';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import React, { useEffect } from 'react';
import baseRoutes from '@/constants/routes';
import ProfileDropdown from './ProfileDropdown';
import axiosInstance from '@/constants/axios';
import api from '@/constants/api';
import { ISubscription } from '#/types/subscription';
import { useUser } from '@/components/hooks/useUser';

const navItemClass =
    'items-center justify-center rounded-md bg-white px-4 py-2 text-base font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50';

export function Navbar() {
    const { user } = useUser(); // use user since it is not guaranteed to be handled by the private route
    const [plans, setPlans] = React.useState<ISubscription[]>([]);

    useEffect(() => {
        axiosInstance
            .get(api.aux.plans)
            .then((res) => {
                setPlans(res.data.plans);
            })
            .catch((err) => {
                console.error(err);
            });
    }, []);

    return (
        <header className="flex h-20 w-full shrink-0 items-center py-6 my-4 px-4 md:px-6 max-w-[90%]">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="lg:hidden mr-auto"
                    >
                        <MenuIcon className="h-6 w-6" />
                        {/* <span className="">Toggle navigation menu</span> */}
                    </Button>
                </SheetTrigger>
                {/* <StatRoomLogo
                    height={48}
                    width={132}
                    className="flex lg:hidden"
                /> */}

                <SheetContent side="left">
                    <StatRoomLogo
                        asIcon
                        height={48}
                        width={48}
                        className="hidden mr-6 lg:flex"
                    />
                    <div className="grid gap-2 py-6">
                        <SheetClose asChild>
                            <NavbarLink title="Home" to="/" sidebar />
                        </SheetClose>
                        <SheetClose asChild>
                            <NavbarLink title="About" to="#" sidebar />
                        </SheetClose>
                        <SheetClose asChild>
                            <NavbarLink title="Contact" to="/contact" sidebar />
                        </SheetClose>
                        <Separator orientation="horizontal" />
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1" className="bg-none">
                                <AccordionTrigger className="font-semibold text-lg">
                                    Plans
                                </AccordionTrigger>
                                <AccordionContent>
        
                                    {plans?.map((plan, _index) => (
                                        <SheetClose key={plan.slug} asChild>
                                            <NavLink
                                                to={`/plans/${plan.slug}`}
                                                className="flex w-full items-center py-2"
                                            >
                                                {plan.target}
                                            </NavLink>
                                        </SheetClose>
                                    ))}

                                    {/* </SheetClose> */}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* <Separator orientation="horizontal" /> */}
                        <NavbarLink title="Sign In" to="/login" sidebar />
                        <NavbarLink
                            title="Get Started"
                            to="/register"
                            sidebar
                        />
                    </div>
                </SheetContent>
            </Sheet>

            <StatRoomLogo height={48} width={132} />

            <nav className="ml-auto hidden lg:flex">
                <div className="flex gap-4">
                    <NavbarLink title="Home" to="/" />
                    <NavbarLink title="About" to="/about" />
                    <NavbarLink title="Contact" to="/contact" />
                    <Separator orientation="vertical" />

                    <NavigationMenu
                        className="z-20"
                        viewPortClassName="right-0"
                    >
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger
                                    triggerMode="click"
                                    className={navItemClass}
                                >
                                    Plans
                                </NavigationMenuTrigger>
                                <NavigationMenuContent className="group ">
                                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.65fr_1fr] z-[10]">
                                        <li className="row-span-3">
                                            <NavigationMenuLink asChild>
                                                <NavLink
                                                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                                                    to={baseRoutes.about}
                                                >
                                                    <StatRoomLogo
                                                        height={50}
                                                        width={50}
                                                        asIcon
                                                        className="group-hover:animate-spin"
                                                    />
                                                    <div className="mb-2 mt-4 text-lg font-medium">
                                                        StatRoom
                                                    </div>
                                                    <p className="text-sm leading-tight text-muted-foreground">
                                                        Your all-in-one sports
                                                        data platform solution
                                                    </p>
                                                </NavLink>
                                            </NavigationMenuLink>
                                        </li>


                                        {plans?.map((plan) => (
                                            <ListItem
                                                key={plan.slug}
                                                to={`/plans/${plan.slug}`}
                                                title={plan.target}
                                            >
                                                {plan.short_description}
                                            </ListItem>
                                        ))}

                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <Separator orientation="vertical" />

                    {user && user.isAuthenticated ? (
                        <>
                            <Button
                                asChild
                                variant={'ghost'}
                                className="flex items-center gap-2"
                            >
                                <NavLink
                                    to={baseRoutes.dashboard}
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <StatRoomLogo
                                        height={30}
                                        width={30}
                                        asIcon
                                    />
                                    <span>Dashboard</span>
                                </NavLink>
                            </Button>
                            <ProfileDropdown />
                        </>
                    ) : (
                        <>
                            <NavbarLink title="Sign In" to="/login" />
                            <NavbarLink
                                title="Get Started"
                                to="/register"
                                as="button"
                            />
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
}

interface NavBarLinkProps {
    title: string;
    to: string;
    sidebar?: boolean;
    as?: 'button' | 'link' | 'menu';
}

const NavbarLink = React.forwardRef<
    HTMLAnchorElement,
    React.RefAttributes<HTMLAnchorElement> & NavBarLinkProps
>(({ title, sidebar = false, to = '#', as = 'link', ...props }, ref) => {
    const NavRoot = as === 'menu' ? NavigationMenu : NavLink;
    const classes =
        as === 'button'
            ? buttonVariants({ variant: 'default', size: 'default' })
            : navItemClass;

    return !sidebar ? (
        <NavRoot
            {...props}
            ref={ref}
            to={to}
            className={`group inline-flex h-9 w-max ${classes}`}
        >
            {title}
        </NavRoot>
    ) : (
        <NavLink
            {...props}
            ref={ref}
            to={to}
            className="flex w-full items-center py-2 text-lg font-semibold"
        >
            {title}
        </NavLink>
    );
});

export const MinimalNavbar = () => {
    return (
        <div className="flex h-20 w-full shrink-0 items-center pt-6 my-6">
            <StatRoomLogo height={48} width={132} />
        </div>
    );
};
