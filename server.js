const express = require('express');
const pgPool = require('./initDb')();
const userRoutes = require('./routes/user');
const bookRoutes = require('./routes/book');
const queryRoutes = require('./routes/query');
const middleware = require('./middleware')();
const app = express();

const PORT = 5000;

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/queries', queryRoutes);

app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT}`);
});
