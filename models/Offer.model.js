const  mongoose=require('mongoose');
const validator = require('validator');
const OfferSchema=mongoose.Schema({
   CuponId:{
        type:String,
        required:true,

    },
    Hotel:[{
        HotelId:{
        type:mongoose.Types.ObjectId,
        ref:'Hotel'
    }}],
    discount:{
        type:String,
        required:true
    },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const OfferModel=mongoose.model('Offer',OfferSchema);
module.exports={
  OfferModel
}