import * as pg from 'pg'
const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chatDatabase',
    password: 'kubica',
    port: 5433,
});

export const addUser = (username, password) => {
    pool.query('INSERT INTO users (username, password) VALUES ($1, $2) ON CONFLICT (username) DO NOTHING', [username, password], (error, result) => {
        if (error) {
            console.log(error.message)
        }
    });
}

export const getPassword = (username) => {
    pool.query('SEELCT password FROM users WHERE username = $1', [username], (error, result) => {
        if (error) {
            console.log(error.message);
            throw error;
        }

        return result;
    })
}

export const getUser = (username) => {
    pool.query('SEELCT * FROM users WHERE username = $1', [username], (error, result) => {
        if (error) {
            console.log(error.message)
            return
        }

        return result;
    })
} 