// filepath: /home/xenith/Triton v2/src/middleware/debug.js
const debugMiddleware = (req, res, next) => {
    console.log('Request URL:', req.originalUrl);
    // Uncomment the following line if you want to log session data
    // console.log('Session data:', req.session);
    next();
};

export default debugMiddleware;