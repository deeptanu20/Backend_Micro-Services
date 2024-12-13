const mongoose=require('mongoose');

function connect(){
    mongoose.connect(process.env.MONGODB_URI)
    .then(
        ()=>{
                console.log('Database connected Successfully')
            }
    ).catch(err=>{
        console.error('Error in database connection',err);
    })
}

module.exports= connect;