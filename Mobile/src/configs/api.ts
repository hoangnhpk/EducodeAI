import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cấu hình Base URL
// Khi test thật trên điện thoại hoặc máy ảo, thay IP bằng IP mạng LAN của bạn.
export const BASE_URL = 'http://192.168.2.10:5210'; 

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
