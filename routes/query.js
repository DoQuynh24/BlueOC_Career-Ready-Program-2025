const express = require('express');
const pgPool = require('../initDb')();
const dalAnalytics = require('../dal/query')(pgPool);
const middleware = require('../middleware')();

const route = express.Router();

//get/query/books/most-borrowed: lấy top 5 sách được mượn nhiều nhất
route.get('/books/most-borrowed', middleware.requireToken, middleware.requireAdmin, (req, res) => {
    dalAnalytics.getMostBorrowedBooks((error, books) => {
        if (error) {
            return res.status(500).json({ message: 'internal Server Error', error: error.message });
        }
        return res.status(200).json(books);
    });
});

module.exports = route;