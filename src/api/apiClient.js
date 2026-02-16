import axios from 'axios';

<<<<<<< HEAD
// const BASE_URL = 'http://localhost:5000/api';
const BASE_URL = "https://hrmbackend-production-6b56.up.railway.app/api"
=======
//const BASE_URL = 'http://localhost:5000/api';
const BASE_URL = 'https://hrmbackend-production-6b56.up.railway.app/api';
>>>>>>> ce03ddeec5a8ee0b365056f760b43d5b4fc82be8

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/auth/login')) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) throw new Error('No refresh token');

                // Use the same BASE_URL for refresh token request
                const response = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken });
                const { accessToken } = response.data.data;
                localStorage.setItem('accessToken', accessToken);
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                localStorage.clear();
                window.location.href = '/';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error.response?.data || error);
    }
);

export default apiClient;
