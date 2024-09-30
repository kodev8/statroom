import { Navbar } from '@/components/Navbar';
import { Outlet } from 'react-router-dom';
import Footer from '@/components/layouts/Footer';
const MainLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
        </>
    );
};

export default MainLayout;
