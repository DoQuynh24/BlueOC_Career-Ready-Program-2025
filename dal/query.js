module.exports = function (pgPool) {
    if (!pgPool || !pgPool.pool) {
        throw Error('missing db connection!');
    }
    const pool = pgPool.pool;

    function getMostBorrowedBooks(callback) {
        const sql = `
            select 
                b.book_id,
                b.title,
                b.author,
                b.genre,
                COUNT(bh.borrowing_id) as borrow_count
            from books b
            join borrowing_history bh ON b.book_id = bh.book_id
            where bh.borrowed_date >= CURRENT_DATE - INTERVAL '6 months'
            group BY b.book_id, b.title, b.author, b.genre
            order BY borrow_count DESC
            LIMIT 5
        `;

        pool.query(sql, [], (error, result) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, result.rows);
        });
    }

    return { getMostBorrowedBooks };
};