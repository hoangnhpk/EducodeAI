import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'https://localhost:7284/api', // Thay bằng Port Backend của bạn
    headers: {
        'Content-Type': 'application/json',
    },
});

// Quan trọng nhất là dòng này
export default axiosInstance;