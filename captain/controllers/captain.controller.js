const captainModel=require('../model/captain.model');
const blacklisttokenModel=require('../model/blacklisttoken.model')
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const dotenv=require('dotenv')
dotenv.config();

const {subscribeToQueue}=require('../service/rabbit');

const pendingRequest= [];

module.exports.register= async(req,res)=>{
    try {
    const {name,email,password}=req.body;
    const captain= await captainModel.findOne({email});

    if(captain){
        return res.status(400).json({message:"Captain already exists"});
    }

    const hash =await bcrypt.hash(password,10);
    const newCaptain=new captainModel({name,email,password:hash})
    await newCaptain.save();

    const token=jwt.sign({id:newCaptain._id},process.env.JWT_SECRET,{expiresIn:'1h'})

    res.cookie('token',token);

    delete newCaptain._doc.password; // deletee the password in the response

    res.send({token,newCaptain});
    

        
    } catch (error) {
        res.status(400).json({message:"Invalid Credential"});
    }
    
}

module.exports.login=async(req,res)=>{
    try {

    const {email,password}=req.body;

    const captain=await captainModel.findOne({email}).select('+password');

    if(!captain){
        return res.status(201).json({message:'Email doesnot exist'});
    }

    const isMatch=await bcrypt.compare(password,captain.password);
        
    if(!isMatch){
        return res.status(400).json({message:'Invalid email or password'});

    }

    const token=jwt.sign({id:captain._id},process.env.JWT_SECRET,{expiresIn: '1h'});

    res.cookie('token',token);


    res.send({token,captain});


    } catch (error) {

    res.status(500).json({ message: error.message });
        
    }
    

}

module.exports.logout=async (req,res)=>{
    try {
        const token=req.cookies.token;
        await blacklisttokenModel.create({ token });
        res.clearCookie('token');
        res.send({ message: 'Captain logged out successfully' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.profile= async(req,res)=>{
    try {
        res.send(req.captain);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports.updateAvailability=async(req,res)=>{
    try {
        const captain=await captainModel.findById(req.captain._id);
        captain.isAvailable=!captain.isAvailable;
        await captain.save();
        res.send(captain);
        
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//long polling 

module.exports.waitForNewRide=async(req,res)=>{

  // set timeout for long polling (30 seconds)   

       req.setTimeout(30000,()=>{
          res.status(204).end();
       })

        pendingRequest.push(res);
}

subscribeToQueue("new-ride",(data)=>{
    const rideData=JSON.parse(data);

     // send the new ride data to all pending requests
    pendingRequest.forEach(res=>{  
        res.json(rideData);
    })

    pendingRequest.length=0; // clear the pending request
   
})

