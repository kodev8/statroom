import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { RouterProvider } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from './components/ui/themeProvider';
import CrumbProvider from './components/hooks/useCrumb';
import SocketProvider from './constants/socket';

const queryClient = new QueryClient();
createRoot(document.getElementById('root')!).render(
    // <StrictMode>
    <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <GoogleOAuthProvider
                clientId={import.meta.env['VITE_GOOGLE_CLIENT_ID']}
            >
                <SocketProvider>
                    <CrumbProvider>
                        <RouterProvider router={App} />
                        <Toaster />
                        </CrumbProvider>
                </SocketProvider>
                {/* <ReactQueryDevtools initialIsOpen={true} /> */}
            </GoogleOAuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
    // </StrictMode>
);
