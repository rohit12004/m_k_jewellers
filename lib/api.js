import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || '',
    withCredentials: true, // Send cookies automatically
});

// Response interceptor for automatic token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 error and haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh endpoint (cookies sent automatically)
                const response = await axios.post(
                    '/api/auth/refresh',
                    {},
                    { withCredentials: true }
                );

                if (response.data.success) {
                    // Retry original request (new access token is in cookie now)
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed - session probably revoked or expired in DB
                // Clear cookies to prevent further retries
                try {
                    await axios.post('/api/auth/logout');
                } catch (e) {
                    // Ignore logout error if already logged out
                }
                
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
