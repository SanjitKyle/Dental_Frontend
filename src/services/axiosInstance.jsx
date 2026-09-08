import axios from 'axios';
export const axiosInstance=axios.create({
    baseURL: 'https://dentalbackend.kyleinfotech.co.in/api',
    headers: {
        'Content-Type': 'application/json',
    },
}); 
