const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({success:false, message:"No token provided. Authorization denied."});
    }

    const token = authHeader.split(" ")[1];

    try{
        const payload = jwt.verify(token, process.env.JWT_Secret);
        req.user = {userID: payload._id, name: payload.name};
        next()
    }catch(error){
        return res.status(401).json({success:false, message:"Invalid or expired token. Authorization denied."});
    }

};

module.exports = auth;