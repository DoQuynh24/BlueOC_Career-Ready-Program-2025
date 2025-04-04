module.exports = function(pgPool){
    if (!pgPool || !pgPool.pool) {
        throw Error('missing DB connection!');
    }
    const pool = pgPool.pool;
    // lấy tất cả sách (có thể lọc theo title, author, genre)
    function getBooks(options, limit = 10, offset = 0, callback) {
        console.log('options: ', options);
        const { title, author, genre } = options || {};

    
        let sql = `
        select book_id, title, author, genre, published_year, created_date
        from books 
        where 1 = 1
        `;

    const params = [];
    if (title){
        params.push(`%${title}%`);
        sql += ` and title ilike $${params.length}`;
    }
    if (genre){
        params.push(`%${author}%`);
        sql += ` and author ilike $${params.length}`;
    }
    if (genre) {
        params.push(genre);
        sql += ` and genre = $${params.length}`;
    }

    sql +=`
        limit ${limit}
        offset ${offset}
    `;
    console.log('sql: ', sql);
    console.log('params: ', params);

    pool.query(sql, params, (error, result) => {
        if (error) {
            return callback(error, null);
        }
        return callback(null, result.rows);
    });
    }
    // lấy thông tin chi tiết của một cuốn sách theo id
    function getBookById(bookId, callback) {
        const sql = `
            select book_id, title, author, genre, published_year, created_date
            from books
            where book_id = $1
        `;
        pool.query(sql, [bookId], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }
    // thêm một cuốn sách mới
    function addBook(book, callback) {
        const { title, author, genre, published_year } = book;
        const sql = `
            insert into books (title, author, genre, published_year)
            values ($1, $2, $3, $4)
            returning book_id, title, author, genre, published_year, created_date
        `;
        const params = [title, author, genre, published_year];

        pool.query(sql, params, (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows[0]);
        });
    }
    return { getBooks, getBookById, addBook};
}