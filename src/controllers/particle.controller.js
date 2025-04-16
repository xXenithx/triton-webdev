import axios from 'axios';
import 'dotenv/config';

// Axios instance setup for API requests
const api = axios.create({
    baseURL: process.env.PARTICLE_BASE_URL,
    headers: {
        "Authorization": `Bearer ${process.env.PARTICLE_AUTH_TOKEN}`,
        "Content-Type": "application/json"
    }
})