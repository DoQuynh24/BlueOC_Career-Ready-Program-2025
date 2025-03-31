const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const middleware = require('./middleware') ();
const JWT_SECRET ='mysecret';

let users =[
    {
        id: 1,
        name: 'DoQuynh',
        email: 'doquynh@example.com',
        password: '$2a$12$8GDWyOeHYVXm7PQTKMvTVOS/47WoUEQgshioQtl2Nl57euqbosBpy' 
    },
    {
        id: 2,
        name: 'BuiLinh',
        email: 'builinh@example.com',
        password: '$2a$12$CLq8VwzlvYzcruoy/6h2Pe2Nc3Z7q4b3xg5X.3xW9XIsgOhgyWUya' 
    }
]

//CRUD users
//create path: POST/users
//read path: list: GET /users <> get detail: GET /users/:id
//update path: update full info of user: PUT /users/:id <> update a part of user info: PATCH /users/:id
//put body: { username: 'admin'}
//patch body: { username: 'admin'} => { username: 'admin', name: 'DoQuynh'}
//delete path: DELETE /users/:id
route.get('/users', (req, res) =>{
    return res.status(200).json(users);
})

route.get('/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const user = users.find(user => user.id === userId);
    if (!user){
        return res.status(404).json({message:"user not found"});
    }
    return res.status(200).json(user);
});

route.post('/users', (req, res) =>{
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'name, email, and password are required' });
    }
    if (users.some(user => user.email === email)){
        return res.status(400).json({message:'email already exist'})
    }
    const hashedPassword = bcrypt.hashSync(password, 12);
    const addId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const addedUser ={ 
        id: addId,
        name,
        email,
        password: hashedPassword
    };
    users.push(addedUser);
    return res.status(200).json(addedUser);
});

route.put('/users/:id', (req, res) =>{
    const userId = parseInt(req.params.id);
    const userIndex = users.findIndex(user => user.id === userId);
    if (userIndex === -1){
        return res.status(404).json ({message: 'user not found'});
    }
    const {name, email, password} = req.body;
    if (!name || !email || !password){
        return res.status(400).json({message:'name, email, and password are required'});
    }
    if ( users.some(user => user.email === email && user.id !== userId)){
        return res.status(400).json({message:'email already exist'});
    }
    const hashedPassword = bcrypt.hashSync(password, 12);
    users[userIndex] ={
        id: userId,
        name,
        email,
        password: hashedPassword
    };
    return res.status(200).json(users[userIndex]);
});

route.delete('/users/:id', (req, res)=>{
    const userId = parseInt(req.params.id);
    const userIndex =  users.findIndex(user => user.id === userId);
    if (userIndex === -1) {
        return res.status(404).json({message:'user not found'});
    }
    users.splice(userIndex, 1);
    return res.status(200).json({message:'user delete successfully'});
});

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
        { expiresIn: '10h'})
        return res.status(200).json({token});

});
module.exports = route;