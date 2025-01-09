const pool = require('./schema');

/**
 * Create a new user in the database
 * @param {string} username - The username of the user
 * @param {string} email - The email address of the user
 * @param {string} hashedPassword - The hashed password of the user
 * @returns {object} - The newly created user
 */
const createUser = async (username, email, hashedPassword) => {
    const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, username, email
    `;
    const values = [username, email, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
};

/**
 * Find a user by their email
 * @param {string} email - The email of the user to find
 * @returns {object|null} - The user if found, otherwise null
 */
const findUserByEmail = async (email) => {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
};

/**
 * Find a user by their ID
 * @param {number} id - The ID of the user to find
 * @returns {object|null} - The user if found, otherwise null
 */
const findUserById = async (id) => {
    const query = `SELECT id, username, email FROM users WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Update a user's details
 * @param {number} id - The ID of the user to update
 * @param {string} username - The updated username
 * @param {string} email - The updated email
 * @returns {object|null} - The updated user if successful, otherwise null
 */
const updateUser = async (id, username, email) => {
    const query = `
        UPDATE users
        SET username = $1, email = $2
        WHERE id = $3
        RETURNING id, username, email
    `;
    const values = [username, email, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
};

/**
 * Delete a user by their ID
 * @param {number} id - The ID of the user to delete
 * @returns {boolean} - True if the user was deleted, otherwise false
 */
const deleteUser = async (id) => {
    const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
};

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    deleteUser,
};