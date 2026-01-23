import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
})


axiosClient.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)


axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // if (error.response?.status === 401) {
    //   window.location.href = '/login'
    // }
    return Promise.reject(error)
  }
)

export default axiosClient as {
  get<T>(url: string): Promise<T>
  post<T>(url: string, data?: any): Promise<T>
  put<T>(url: string, data?: any): Promise<T>
  delete<T>(url: string): Promise<T>
}
