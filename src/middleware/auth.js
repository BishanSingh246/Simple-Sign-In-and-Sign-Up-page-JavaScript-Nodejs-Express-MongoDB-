const jwt = require("jsonwebtoken");
const Userdb = require("../models/signup")

const auth = async (req, res, next) =>{
    try {
        
        const token = req.cookies.jwt;
        console.log(token);
        const verifyuser = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verifyuser);

        const  singleUser = await Userdb.findOne({_id:verifyuser._id})
        // console.log(user);
        console.log(singleUser.fname);

        req.token = token;
        req.singleUser = singleUser


        next();



    } catch (error) {
        res.status(401).send(error)
    }
}

module.exports = auth;