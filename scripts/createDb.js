const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL.replace(
            /\/([^\/]+)$/,
            '/postgres'
        ),
    });

    try {
        await client.connect();
        await client.query('CREATE DATABASE drexelbnb;');
        console.log('Database drexelbnb created successfully!');
    } catch (err) {
        if (err.code === '42P04') {
            // PostgreSQL error code for "duplicate database"
            console.log('Database drexelbnb already exists.');
        } else {
            console.error('Error creating database:', err.message);
        }
    } finally {
        await client.end();
    }
}

createDatabase();
