const  mongoose=require('mongoose');
const validator = require('validator');
const moment = require("moment-timezone");
const BookingSchema=mongoose.Schema({
   UserId:{
        type:mongoose.Types.ObjectId,
        ref:'user'
    },
   
    HotelId:{
        type:mongoose.Types.ObjectId,
        ref:'Hotel'
    },
    roomsId:{
        type:mongoose.Types.ObjectId,
        ref:'Room'
    },
    duration:{
        type:String
    },
    gstAmount:{
        type:String,
    },
    totalPrice:{
      type:String  
    },
    StartingDate:{
        type:String
    },
    EndDate:{
        type:String
    },
    AppliedOfferId:{
        type:mongoose.Types.ObjectId,
        ref:'Offer'
    },
    finalPrice:{
        type:String
    },
    basePrice:{
        type:String
    },
    numberOfRooms:{
        type:String
    },
    offerDiscountMoney:{
        type:String
    },
    numberOfGuests:{
        type:String
    },
    isBooked:{
        type:Boolean,
        default:false
    },   
    createdAt: {
        type:Date,
        default:Date.now,
      },
      paymentId:{
        type:mongoose.Types.ObjectId,
        ref:"Payment"
      },
      timestamp: {
        type:Date, default: () => moment().tz("Asia/Kolkata").toDate()
    }
})

const BookingModel=mongoose.model('Booking',BookingSchema);
module.exports={
  BookingModel
}