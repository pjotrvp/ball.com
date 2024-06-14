module.exports = {
    host: process.env.READ_DB_HOST,
    user: process.env.READ_DB_USER,
    password: process.env.READ_DB_PASSWORD,
    database: process.env.READ_DB_NAME,
    port: process.env.READ_DB_PORT,
    connectionLimit: 10,
}