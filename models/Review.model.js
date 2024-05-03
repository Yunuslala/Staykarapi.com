const  mongoose=require('mongoose');
const validator = require('validator');
const ReviewSchema=mongoose.Schema({
   UserId: {
    type: mongoose.Types.ObjectId,
    ref:"user"
      },
      HotelId: {
        type: mongoose.Types.ObjectId,
        ref:"Hotel"
          },
      text: {
        type: String,
        required:true,
      },
    ratings:{
        type:Number,
        required:true
    },
    ReviewImages:[{
        url:{
            type:String,
        }

    }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const ReviewModel=mongoose.model('Review',ReviewSchema);
module.exports={
  ReviewModel
}