const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET ='mysecret';


let users =[
    {
        id: 1,
        name: 'DoQuynh',
        email: 'doquynh@example.com',
        password: '$2a$12$8GDWyOeHYVXm7PQTKMvTVOS/47WoUEQgshioQtl2Nl57euqbosBpy',
        role: 'admin' 
    },
    {
        id: 2,
        name: 'BuiLinh',
        email: 'builinh@example.com',
        password: '$2a$12$CLq8VwzlvYzcruoy/6h2Pe2Nc3Z7q4b3xg5X.3xW9XIsgOhgyWUya',
        role: 'user' 
    }
]
route.post('/login', function (req, res){
    const {email, password} = req.body;
    if (!email || !password){
        return res.status(400).json({ message: 'email or password are invalid'});
    }
    const loginUser = users.find(user => user.email === email)
    if (!loginUser){
        return res.status(400).json({ message: 'email or password are invalid'});
    }
    const isValid = bcrypt.compareSync(password, loginUser.password);
    if (!isValid){
        return res.status(400).json({ message: 'email or password are invalid'});
    }
    const token = jwt.sign(
        {id: loginUser.id, email: loginUser.email, name: loginUser.name},
        JWT_SECRET,
        { expiresIn: '1h'})
        return res.status(200).json({token});

});
module.exports = route;