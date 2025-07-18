
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const authToken = async (req, res, next) => {
    try {
        

        let token = req.cookies?.token; 
       
        if (!token && req.headers.authorization?.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }


        if (!token) {
  
            return res.status(401).json({
                message: "Please Login........!",
                success: false,
                error:true,
            });
        }

        try {
          
            const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
            
            req.userId = decoded.id || decoded._id;


       
            const user = await userModel.findById(req.userId);

            if (!user) {
                
                return res.status(403).json({
                    message: "Unauthorized: User not found",
                    success: false,
                    error:true,
                });
            }

            req.user = user; 
            next();

        } catch (err) {
            
            return res.status(401).json({
                message: "Unauthorized: Invalid or Expired Token",
                success: false
            });
        }

    } catch (err) {
      
        return res.status(500).json({
            message: "Internal Server Error",
            success: false
        });
    }
};

module.exports = authToken;