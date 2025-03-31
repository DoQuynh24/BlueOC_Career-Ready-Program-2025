const jwt = require('jsonwebtoken');
const JWT_SECRET ='mysecret';
module.exports = function(){
    function requireToken(req, res, next){
        const authHeader = req.headers['authorization'];
        if(!authHeader){
            return res.status(401).json({message:'Authorization header is required'});
        }

        //validate
        //Bearer <token>
        const arr = authHeader.split(' ');
        if (!arr || arr.lenght <=1){
            return res.status(401).json({message:'Invalid authorization format'});
        }
        const token = arr[1];
        if (!token){
            return res.status(401).json({message:'Unauthentication'})
        }
        
        jwt.verify(token, JWT_SECRET, function (error, payload){
            if( error){
                return res.status(401).json({messages: 'Invalid token'})
            }
            req.user = payload;
            return next();
        })
    }
    return {requireToken};
}