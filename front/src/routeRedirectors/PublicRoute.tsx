import { Navigate, Outlet } from 'react-router-dom';
// import { useUserStore, TUserStore } from '@/stores/user.store';
import { useUser } from '@/components/hooks/useUser';
import routes from '@/constants/routes';

const PublicRoute = () => {
    const { user } = useUser();

    return (!user?.isAuthenticated) ? (
        <Outlet />
    ) : (
        <Navigate to={routes.dashboard} />
    );
};

export default PublicRoute;
