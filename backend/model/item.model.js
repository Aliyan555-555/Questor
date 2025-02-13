import mongoose from 'mongoose';


const ItemSchema  = new mongoose.Schema({
    resource:{
        type:String,
        required:true
    }
})


export const itemModel = mongoose.model('Item',ItemSchema)