import React from 'react';
import { cn } from '@/lib/utils';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { NavLink, NavLinkProps } from 'react-router-dom';

const ListItem = React.forwardRef<
    React.ElementRef<'a'>,
    React.ComponentPropsWithoutRef<'a'> & NavLinkProps
>(({ className, title, children, to = '#', ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <NavLink
                    to={to}
                    ref={ref}
                    className={cn(
                        'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">
                        {title}
                    </div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </NavLink>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = 'ListItem';

export { ListItem };
