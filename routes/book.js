const express = require('express');
const pgPool = require('../initDb')();
const dalBook = require('../dal/book')(pgPool);
const middleware = require('../middleware')();

const route = express.Router();

// get/books: lấy tất cả 
route.get('/', (req, res) => {
    const { limit = 10, offset = 0, title, author, genre } = req.query;
    const options = { title, author, genre };

    dalBook.getBooks(options, limit, offset, (error, books) => {
        if (error) {
            return res.status(500).json({ message: 'internal server error', error: error.message });
        }
        return res.status(200).json(books);
    });
});

// get/books/:id: lấy thông tin chi tiết 
route.get('/:id', middleware.requireToken, (req, res) => {
    const bookId = parseInt(req.params.id);

    dalBook.getBookById(bookId, (error, book) => {
        if (error) {
            return res.status(500).json({ message: 'internal server error', error: error.message });
        }
        if (!book) {
            return res.status(404).json({ message: 'book not found' });
        }
        return res.status(200).json(book);
    });
});

// post /books: thêm sách 
route.post('/', middleware.requireToken, middleware.requireAdmin, (req, res) => {
    const { title, author, genre, published_year } = req.body;

    if (!title || !author || !genre || !published_year) {
        return res.status(400).json({ message: 'title, author, genre, and published_year are required' });
    }

    const book = { title, author, genre, published_year };
    dalBook.addBook(book, (error, newBook) => {
        if (error) {
            return res.status(500).json({ message: 'internal server error', error: error.message });
        }
        return res.status(201).json(newBook);
    });
});
module.exports = route;