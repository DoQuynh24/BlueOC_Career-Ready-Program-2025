module.exports = function (pgPool) {
    if (!pgPool || !pgPool.pool) {
        throw Error('missing DB connection!');
    }
    const pool = pgPool.pool;

    //lấy tất cả người dùng
    function getUsers(callback) {
        const sql = `
            select id, name, email, role, created_at
            from users
        `;
        pool.query(sql, [], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows);
        });
    }

    //lấy thông tin chi tiết của một người dùng theo id
    function getUserById(userId, callback) {
        const sql = `
            select id, name, email, role, created_at
            from users
            where id = $1
        `;
        pool.query(sql, [userId], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }

    //lấy người dùng theo email (dùng cho đăng nhập)
    function getUserByEmail(email, callback) {
        const sql = `
            select id, name, email, password, role, created_at
            from users
            where email = $1
        `;
        pool.query(sql, [email], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }

    //thêm một người dùng mới
    function addUser(user, callback) {
        const { name, email, password, role } = user;
        const sql = `
            insert into users (name, email, password, role)
            values ($1, $2, $3, $4)
            RETURNING id, name, email, role, created_at
        `;
        const params = [name, email, password, role];

        pool.query(sql, params, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }

    //cập nhật thông tin người dùng
    function updateUser(userId, user, callback) {
        const { name, email, password, role } = user;
        const sql = `
            update users
            set name = $1, email = $2, password = $3, role = $4
            where id = $5
            RETURNING id, name, email, role, created_at
        `;
        const params = [name, email, password, role, userId];

        pool.query(sql, params, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }

    //xóa người dùng
    function deleteUser(userId, callback) {
        const sql = `
            delete from users
            where id = $1
            RETURNING id
        `;
        pool.query(sql, [userId], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }

    return { getUsers, getUserById, getUserByEmail, addUser, updateUser, deleteUser };
};