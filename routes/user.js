const express = require('express');
const route = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const middleware = require('../middleware') ();
const JWT_SECRET ='mysecret';
const { body, validationResult } = require('express-validator');

const pgPool = require('../initDb')();
const dalUser = require('../dal/user')(pgPool);

// let users =[
//     {
//         id: 1,
//         name: 'DoQuynh',
//         email: 'doquynh@example.com',
//         password: '$2a$12$8GDWyOeHYVXm7PQTKMvTVOS/47WoUEQgshioQtl2Nl57euqbosBpy',
//         role: 'admin' 
//     },
//     {
//         id: 2,
//         name: 'BuiLinh',
//         email: 'builinh@example.com',
//         password: '$2a$12$CLq8VwzlvYzcruoy/6h2Pe2Nc3Z7q4b3xg5X.3xW9XIsgOhgyWUya',
//         role: 'user' 
//     }
// ]
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

route.get('/', (req, res) => {
    dalUser.getUsers((error, users) => {
        if (error) {
            return res.status(500).json({ message: 'internal server error', error: error.message });
        }
        return res.status(200).json(users);
    });
});
route.get('/:id', middleware.requireToken, (req, res) => {
    const userId = parseInt(req.params.id);
    dalUser.getUserById(userId, (error, user) => {
        if (error) {
            return res.status(500).json({ message: 'internal server error', error: error.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }
        return res.status(200).json(user);
    });
});
// post /users -tạo người dùng mới (cần token, có validation)
route.post('/', middleware.requireToken,
    [
        body('name').notEmpty().withMessage('name is required'),
        body('email').isEmail().withMessage('email must be valid'),
        body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters long'),
        body('role').isIn(['admin', 'user']).withMessage('role must be either "admin" or "user"')
    ], validate,
    (req, res) => {
        const { name, email, password, role } = req.body;

        dalUser.getUserByEmail(email, (error, existingUser) => {
            if (error) {
                return res.status(500).json({ message: 'internal server error', error: error.message });
            }
            if (existingUser) {
                return res.status(400).json({ message: 'email already exist' });
            }

            const hashedPassword = bcrypt.hashSync(password, 12);
            const newUser = { name, email, password: hashedPassword, role };

            dalUser.addUser(newUser, (error, addedUser) => {
                if (error) {
                    return res.status(500).json({ message: 'internal server error', error: error.message });
                }
                return res.status(201).json(addedUser);
            });
        });
    });
// put /users/:id - Cập nhật toàn bộ thông tin người dùng (cần token, quyền admin, có validation)
route.put('/:id', middleware.requireToken, middleware.requireAdmin,
    [
    body('name').notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('email must be valid'),
    body('password').isLength({ min: 6 }).withMessage('password must be at least 6 characters long'),
    body('role').isIn(['admin', 'user']).withMessage('role must be either "admin" or "user"')
    ], validate,
    (req, res) => {
    const userId = parseInt(req.params.id);
    const { name, email, password, role } = req.body;

        // Kiểm tra user có tồn tại không
        dalUser.getUserById(userId, (error, user) => {
            if (error) {
                return res.status(500).json({ message: 'internal server error', error: error.message });
            }
            if (!user) {
                return res.status(404).json({ message: 'user not found' });
            }

            dalUser.getUserByEmail(email, (error, existingUser) => {
                if (error) {
                    return res.status(500).json({ message: 'internal server error', error: error.message });
                }
                if (existingUser && existingUser.id !== userId) {
                    return res.status(400).json({ message: 'email already exist' });
                }

                const hashedPassword = bcrypt.hashSync(password, 12);
                const updatedUser = { name, email, password: hashedPassword, role };

                dalUser.updateUser(userId, updatedUser, (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: 'internal server error', error: error.message });
                    }
                    return res.status(200).json(result);
                });
            });
        });
    });
// detete /users/:id -xóa một người dùng (cần token và quyền admin)
route.delete('/:id', middleware.requireToken, middleware.requireAdmin, (req, res) => {
    const userId = parseInt(req.params.id);

    dalUser.getUserById(userId, (error, user) => {
        if (error) {
            return res.status(500).json({ message: 'internal server error', error: error.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'user not found' });
        }

        dalUser.deleteUser(userId, (error, result) => {
            if (error) {
                return res.status(500).json({ message: 'internal server error', error: error.message });
            }
            return res.status(200).json({ message: 'user deleted succesfully' });
        });
    });
});

route.post('/login', function (req, res){
    const {email, password} = req.body;
    if (!email || !password){
        return res.status(400).json({ message: 'email or password are invalid'});
    }

    dalUser.getUserByEmail(email, (error, loginUser) => {
    if (error) {
        return res.status(500).json({ message: 'internal server error', error: error.message });
    }
    if (!loginUser){
        return res.status(400).json({ message: 'email or password are invalid'});
    }
    const isValid = bcrypt.compareSync(password, loginUser.password);
    if (!isValid){
        return res.status(400).json({ message: 'email or password are invalid'});
    }

    const token = jwt.sign(
        { id: loginUser.id, email: loginUser.email, name: loginUser.name, role: loginUser.role },
        JWT_SECRET,
        { expiresIn: '10h' }
    );
    return res.status(200).json({ token });
});
});
module.exports = route;