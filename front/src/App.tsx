import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
    Navigate,
} from 'react-router-dom';
// auth pages, layout, loaders
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import AuthLayout from './components/layouts/AuthLayout';

// base pages and layout
import Home from './pages/Base/Home';
import Account from './pages/Profile/Account';
import Services from './pages/Base/Subscriptions';
import subscriptionLoader from './pages/Base/subscriptionLoader';
import Contact from './pages/Base/Contact';
import About from './pages/Base/About';
import MainLayout from './components/layouts/MainLayout';
import TeamInvite from './pages/Base/TeamInvite';

// Productivity pages, layout
import ProjectList from './pages/Productivity/Projects/ProjectList';
import Project from './pages/Productivity/Projects/Project';
import Dashboard from './pages/Productivity/Dashboard/Dashboard';
import Teams from './pages/Productivity/Teams';
import DashboardLayout from './components/layouts/DashboardLayout';

// profile pages, layout
import UserLayout from './components/layouts/AccountLayout';
import Security from './pages/Profile/Security';
import Billing from './pages/Profile/Billing';
import Integrations from './pages/Profile/Integrations';
import Notifications from './pages/Profile/Notifications';
import ToastRedirectWrapper from './components/ToastWrapper';
import Preferences from './pages/Profile/Preferences';

// route redirectors
import baseRoutes from './constants/routes';
import PublicRoute from './routeRedirectors/PublicRoute';
import PrivateRoute from './routeRedirectors/PrivateRoute';
import NotFound from './pages/NotFound';

import {
    GithubRedirectLoader,
    GithubRedirect,
} from './components/oauth/Github';

const App = createBrowserRouter(
    createRoutesFromElements(
        <>
            {/* Auth routes */}
            <Route
                element={<ToastRedirectWrapper />}
                // errorElement={<div>error</div>}
            >
                <Route element={<PublicRoute />}>
                    <Route element={<AuthLayout />}>
                        <Route
                            path={baseRoutes.register}
                            Component={Register}
                        />
                        <Route path={baseRoutes.login} Component={Login} />
                        <Route
                            path={baseRoutes.forgotPassword}
                            Component={ForgotPassword}
                        />
                        <Route
                            path={baseRoutes.githubSuccess}
                            Component={GithubRedirect}
                            loader={GithubRedirectLoader}
                            errorElement={<GithubRedirect fail />}
                        />
                    </Route>
                </Route>

                {/* Base routes */}
                <Route element={<MainLayout />}>
                    <Route path={baseRoutes.home} Component={Home} />
                    <Route path={baseRoutes.contact} Component={Contact} />
                    <Route path={baseRoutes.about} Component={About} />
                    <Route
                        path={`${baseRoutes.plans}`}
                        Component={Services}
                        loader={subscriptionLoader}
                        errorElement={
                            <Navigate
                                to={baseRoutes.home}
                                state={{
                                    toast: {
                                        title: 'Error',
                                        variant: 'descructive',
                                        description:
                                            'We could not find the plan you are looking for',
                                    },
                                }}
                            />
                        }
                    />
                </Route>

                {/* Account routes */}
                <Route element={<PrivateRoute />}>
                    <Route
                        path="/account"
                        element={<UserLayout />}
                        handle={{
                            title: 'Account Settings',
                        }}
                    >
                        <Route index Component={Account} />
                        <Route
                            path="security"
                            handle={{
                                title: 'Security',
                            }}
                        >
                            <Route index Component={Security} />
                            <Route
                                path="reset-password"
                                Component={ResetPassword}
                                handle={{
                                    title: 'Manage Password',
                                }}
                            />
                        </Route>
                        <Route
                            path="billing"
                            Component={Billing}
                            handle={{
                                title: 'Billing',
                            }}
                        />
                        <Route
                            path="notifications"
                            Component={Notifications}
                            handle={{
                                title: 'Notifications',
                            }}
                        />
                        <Route
                            path="integrations"
                            Component={Integrations}
                            handle={{
                                title: 'Integrations',
                            }}
                        />
                        <Route
                            path="preferences"
                            Component={Preferences}
                            handle={{
                                title: 'Preferences',
                            }}
                        />
                    </Route>

                    {/* Productivity routes */}

                    <Route
                        element={<DashboardLayout />}
                        handle={{
                            crumb: {
                                label: 'Dashboard',
                                type: 'link',
                            },
                        }}
                    >
                        <Route
                            path={`${baseRoutes.teamInvites}/:id`}
                            Component={TeamInvite}
                        />
                    </Route>

                    <Route
                        path={baseRoutes.dashboard}
                        element={<DashboardLayout />}
                        handle={{
                            crumb: {
                                label: 'Dashboard',
                                type: 'link',
                            },
                        }}
                    >
                        <Route index Component={Dashboard} />
                        <Route
                            path={baseRoutes.projects}
                            handle={{
                                crumb: {
                                    label: 'Projects',
                                    type: 'link',
                                },
                            }}
                        >
                            <Route index Component={ProjectList} />
                            <Route
                                path=":id"
                                Component={Project}
                                // handle={{
                                //     crumb: {
                                //         label: 'Project One - Demo',
                                //         type: 'page',
                                //     },
                                // }}
                            />
                        </Route>
                        <Route
                            path="teams"
                            handle={{
                                crumb: {
                                    label: 'Teams',
                                    type: 'link',
                                },
                            }}
                        >
                            <Route index Component={Teams} />
                            <Route
                                path=":id"
                                Component={Teams}
                                // handle={{
                                //     crumb: {
                                //         label: 'Team One - Demo',
                                //         type: 'page',
                                //     },
                                // }}
                            />
                        </Route>
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </>
    )
);
export default App;
