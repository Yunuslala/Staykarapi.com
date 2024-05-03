const  mongoose=require('mongoose');
const RoomSchema=mongoose.Schema({
    Capacity: {
        type: Number,
        required:true,
        default:3
      },
      hotelId:{
        type:mongoose.Types.ObjectId,
        ref:"Hotel"
      },
      roomsType:{
        type:String,
        default:'deluxe',
        unique:true,
        enum:['deluxe','large,small']
      },
      Price: {
        type: Number
      },
      isAvaliable:{
        type:Boolean,
        default:false,
      },
    roomImages:[{
      imageUrl: {
        type: String,
        required:[true,"room Images Are required"]
      },
      Key: {
        type: String,
      },
      roomsQuantity:{
        type:Number,
        default:1
      }
    
    }]
})

const RoomModel=mongoose.model('Room',RoomSchema);
module.exports={
  RoomModel
}