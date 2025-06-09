const config = {
    // Server
    port: process.env.PORT,
    jwt_secret: process.env.JWT_SECRET,

    // Database
    mongo_uri: process.env.MONGO_URI,

    // Redis
    redis_port: process.env.REDIS_PORT,
    redis_host: process.env.REDIS_HOST,
    redis_password: process.env.REDIS_PASSWORD,

    // SMTP Email Configuration
    smtp_host: process.env.SMTP_HOST,
    smtp_port: process.env.SMTP_PORT,
    smtp_secure: process.env.SMTP_SECURE === "true",
    smtp_user: process.env.SMTP_USER,
    smtp_pass: process.env.SMTP_PASS,


    node_env: process.env.NODE_ENV,
    backend_url: process.env.BACKEND_URL,
    client_url: process.env.CLIENT_URL,
};

module.exports = config;