module.exports = {
    host: process.env.WRITE_DB_HOST,
    user: process.env.WRITE_DB_USER,
    password: process.env.WRITE_DB_PASSWORD,
    database: process.env.WRITE_DB_NAME,
    port: process.env.WRITE_DB_PORT,
    connectionLimit: 10,
}