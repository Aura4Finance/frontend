import axios from "axios";

const client = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL as string,
    withCredentials: true
});

export default client;