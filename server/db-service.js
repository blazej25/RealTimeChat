import * as pg from 'pg'
const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'chatDatabase',
    password: 'kubica',
    port: 5433,
});

export const addUser = (username, uid) => {
    pool.query('INSERT INTO public.users1 (id, username) VALUES ($1, $2);', [uid, username], (error, result) => {
        if (error) {
            console.log(error.message)
        }
    });
}

