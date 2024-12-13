const rideModel=require('../model/ride.model');
const {publishToQueue}=require('../service/rabbit')

module.exports.createRide=async(req,res)=>{
try {
    
     const {pickup,destination}=req.body;      // user will get from userAuth

     
     const newRide=new rideModel({            //create ride
        user:req.user._id,
        pickup,
        destination
     })
     await newRide.save();
     publishToQueue("new-ride",JSON.stringify(newRide));
     res.send(newRide);
    




} catch (error) {
    res.status(400).json({message:error.message});
}
}

module.exports.acceptRide=async(req,res)=>{
    const {rideId} = req.query;
    const ride=await rideModel.findById(rideId);

    if(!ride){
        return res.status(404).json({message:'Ride not found'});
    }

    ride.status ='accepted';
    await ride.save();
    publishToQueue('ride-accepted',JSON.stringify(ride));
    res.send(ride);
}
