import { X } from 'lucide-react';
import React from 'react';

type TagProps = {
    editable?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
};
export function Tag({ editable = false, children, onClick }: TagProps) {
    return (
        <div className="flex items-center gap-2 px-2 py-1 bg-primary-foreground text-primary rounded-md bg-slate-100 w-fit dark:bg-transparent dark:border">
            <span className="text-sm">{children}</span>
            {editable && (
                <X
                    className="text-slate-400 h-3 w-3 hover:text-red-500 cursor-pointer"
                    onClick={onClick}
                />
            )}
        </div>
    );
}
