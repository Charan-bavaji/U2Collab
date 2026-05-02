import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,   // sends the HttpOnly cookie automatically
})

export default api