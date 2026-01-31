import axios from "axios";

const client = axios.create({
    baseURL: "http://localhost:3000/v1",
    withCredentials: true
});

export default client;