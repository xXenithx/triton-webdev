import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import httpsRouter from './src/routes/https.router.js';
import authRouter from './src/routes/auth.router.js';
import https from 'https';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

//Importing Middlewares
import { debugMiddleware }from './src/middlewares/debug.js';

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an Express application and set the port
const app = express();
const PORT = process.env.PORT || 3000;

// Load SSL certificate and key
const key = fs.readFileSync(path.join(__dirname, 'certs/key.pem'));
const cert = fs.readFileSync(path.join(__dirname, 'certs/cert.pem'));
const credentials = {key , cert};

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Middleware to parse cookies
app.use(cookieParser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle sessions
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true, // Set to true if using HTTPS
        maxAge: 60000 // 1 minute
    }
}));

// Initialize custom middlewares
app.use(debugMiddleware);

// Initialize routes
app.use('/', httpsRouter);
app.use('/auth', authRouter);

// Start the HTTPS server
https.createServer(credentials, app).listen(PORT, () => {
    console.log(`Server is running on https://localhost:${PORT}`);
});