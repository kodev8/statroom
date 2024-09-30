import axios, {
    AxiosError,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env['VITE_API_URL'] as string,
    withCredentials: true,
});

export const axiosAIinstance = axios.create({
    baseURL: import.meta.env['VITE_AI_API_URL'] as string,
    withCredentials: true,
});

const tokenInterceptor = (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('xsrfToken');
    if (token) {
        config.headers['X-XSRF-Token'] = token;
    }
    return config;
}

axiosInstance.interceptors.request.use(
    tokenInterceptor,
    (error: Error) => {
        return Promise.reject(error);
    }
);

axiosAIinstance.interceptors.request.use(
    tokenInterceptor,
    (error: Error) => {
        return Promise.reject(error);
    }
);

const refreshInterceptor = async (error: AxiosError) => {
    const originalRequest = error.config;

    const respData = error.response?.data as { error: string };
    if (
        error.response?.status === 401 &&
        respData.error === 'Invalid token'
    ) {
        try {
            const response = await axios.get(
                `${import.meta.env['VITE_API_URL']}/auth/refresh-token`,
                { withCredentials: true }
            );

            const token = response.data.token;

            if (!token) {
                return Promise.reject(error);
            }

            localStorage.setItem('xsrfToken', token);

            (originalRequest as InternalAxiosRequestConfig).headers[
                'X-XSRF-Token'
            ] = token;
            return axios(originalRequest as InternalAxiosRequestConfig);
        } catch (_error) {
            // Handle refresh token failure
            // if (window.location.pathname !== '/login') {
            //     window.location.href = '/login';
            // }
        }
    }

    return Promise.reject(error);
}

axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    refreshInterceptor
);
axiosAIinstance.interceptors.response.use(
    (response: AxiosResponse) => response,
    refreshInterceptor
);

export default axiosInstance;
