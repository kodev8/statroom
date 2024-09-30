import { Navigate, Outlet } from 'react-router-dom';
import routes from '@/constants/routes';
import ReactLoading from 'react-loading';
import { useUser } from '@/components/hooks/useUser';
// import { useEffect } from 'react';
// import { useUserStore, TUserStore } from '@/stores/user.store';

const PrivateRoute = () => {
   
    const { isLoading, error } = useUser();
    

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ReactLoading type="spin" color="#000" />;
            </div>
        );
    }

    if (error) {
       
        return (
            <Navigate
                to={routes.login}
                state={{
                    toast: {
                        title: 'Unauthorized',
                        description: 'You need to login to access this page',
                        variant: 'destructive',
                    },
                }}
            />
        );
    }

    return <Outlet />;
};

export default PrivateRoute;
