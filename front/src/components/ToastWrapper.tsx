import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useToast } from '@/components/hooks/use-toast';
type TRedirectToast = {
    description: string;
    variant: 'default' | 'destructive' | 'success';
    title: string;
};

export type TToastLocationState = {
    toast: TRedirectToast;
};

function ToastRedirectWrapper() {
    const location = useLocation();
    const state = location.state as TToastLocationState;
    const { toast } = useToast();

    useEffect(() => {
        if (state?.toast) {
            toast({
                variant: state.toast.variant,
                title: state.toast.title,
                description: state.toast.description,
                duration: 3000,
            });
        }
    }, [state, toast]);
    return <Outlet />;
}

export default ToastRedirectWrapper;
