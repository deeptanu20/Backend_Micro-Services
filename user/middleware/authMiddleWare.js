const jwt =require('jsonwebtoken');

const userModel=require('../model/user.model');
const blacklisttokenModel=require('../model/blacklisttoken.model')

module.exports.userAuth= async(req,res,next)=>{
    try {
        // check  token in cookies and headers both
        
        const token=req.cookies.token || req.headers.authorization.split(' ')[ 1 ];


        if(!token){
            return res.status(401).json({message:'Unauthorized'});
        }

        const isBlacklisted=await blacklisttokenModel.find({token});

        if(isBlacklisted.length){
            return res.status(401).json({message:'Unauthorized'});
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET);

        const user=await userModel.findById(decoded.id);

        if(!user){
            return res.status(401).json({message:'Unauthorized'});
        }

        req.user=user;


        next();



    } catch (error) {
        res.status(500).json({message:error.message});
    }
}
