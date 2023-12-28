import mongoose from 'mongoose';

const connect = async() =>{
    if(process.env.mongo_URI)
    {
        try{
            const connection = await mongoose.connect(process.env.mongo_URI);
    
        }catch(err){
            console.log(err);
        }
    };
}

export default connect;