import { MinimalNavbar } from '../Navbar';
import { Outlet } from 'react-router-dom';
const AuthLayout = () => {
    return (
        <div className="max-w-[1280px] m-auto">
            <MinimalNavbar />
            <main className="flex items-center justify-center">
                <Outlet />
            </main>
        </div>
    );
};

export default AuthLayout;
