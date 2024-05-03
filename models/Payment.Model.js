const  mongoose=require('mongoose');
const validator = require('validator');
const PaymentSchema=mongoose.Schema({
   BookingId:{
        type:mongoose.Types.ObjectId,
        ref:'Booking'
    },
    paymentMode:{
        type:String,
        enum:["Cash On site","Online Payment"]
    },
    isPaid:{
        type:Boolean,
        default:false
    },
    razorpay_signature: String,
    razorpay_payment_id: String,
    razorpay_order_id: String,
    invoice_pdf_url: String,
    paymentDate:{
        type:String
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
})

const PaymentModel=mongoose.model('Payment',PaymentSchema);
module.exports={
  PaymentModel
}