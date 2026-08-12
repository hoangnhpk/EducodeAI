import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const BACKEND_PORT = 5000;

// Tự lấy IP máy đang chạy Metro (npx expo start) từ hostUri — điện thoại kết nối
// được Metro thì cũng kết nối được backend trên cùng máy đó, không ai phải sửa IP.
const layHostDev = (): string | null => {
    const hostUri = Constants.expoConfig?.hostUri;
    if (!hostUri) return null;
    const host = hostUri.split(':')[0];
    return host ? `http://${host}:${BACKEND_PORT}` : null;
};

// Ưu tiên EXPO_PUBLIC_API_URL (đặt trong .env khi có server chung/deploy),
// sau đó tự phát hiện IP máy dev, cuối cùng fallback localhost.
export const BASE_URL =
    process.env.EXPO_PUBLIC_API_URL ?? layHostDev() ?? `http://localhost:${BACKEND_PORT}`;

const api = axios.create({
    baseURL: BASE_URL + '/api',
    timeout: 30000,
});

// Interceptor: Tự động đính kèm Token
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor: Xử lý Response lỗi
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token hết hạn hoặc không hợp lệ -> Xoá token
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('user');
        }
        return Promise.reject(error);
    }
);

export default api;
