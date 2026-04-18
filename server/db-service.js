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

export const getUserByUsername = async (username) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
} 

export const getUserByID = async (id) => {
    try {
        const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        return result.rows[0];
    } catch (error) {
        console.error(error);
    }
}