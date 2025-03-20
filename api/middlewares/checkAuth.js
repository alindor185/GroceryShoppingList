const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.user = decodedToken; // Attach decoded token payload to req.user
        next();
    } catch (error) {
        console.log("error", error)
        res.status(401).json({ message: 'Authentication failed' });
    }
};

module.exports = checkAuth;
