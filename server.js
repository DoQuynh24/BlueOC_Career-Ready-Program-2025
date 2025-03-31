const express = require('express');
const route = require('./route');

const app = express();

const PORT = 5000;

app.use(express.json());
app.use('/api', route);
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT}`);
});
