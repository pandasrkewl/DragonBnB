const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString:
        process.env.DATABASE_URL ||
        'postgres://postgres:postgres@localhost:5432/drexelbnb',
});

pool.connect()
    .then((client) => {
        console.log('Successfully connected to drexelbnb database.');
        client.release();
    })
    .catch((err) => {
        console.error(
            'Error connecting to the drexelbnb database:',
            err.message
        );
    });

module.exports = pool;
