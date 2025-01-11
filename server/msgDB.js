const pool = require('./schema').pool;

//create msg by user id and recipient id

const createMsg = async (user_id, recipient_id, content) => {
    const query = `
        INSERT INTO messages (user_id, recipient_id, content)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, recipient_id, content
    `;
    const values = [user_id, recipient_id, content];
    const result = await pool.query(query, values);
    return result.rows[0];
}

//find all msgs by id and recipient id

const findAllMsgsById = async (user_id, recipient_id) => {
    const query = `SELECT content FROM messages WHERE user_id = $1 AND recipient_id = $2`;
    const result = await pool.query(query, [user_id, recipient_id]);
    return result.rows;
}

const findUserById = async (id) => {
    const query = `SELECT id, username, email FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

module.exports = {
    createMsg,
    findAllMsgsById,
    findUserById
}