const express=require("express");
const BookingRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const {InitiateBookings,ApplyOffer,verifyUserDuringpayment,ConfirmBooking,paymentVerify,GetCalcualteFinalPrice}=require("../controllers/Booking.Controller")



BookingRouter.route("/User/InitiateBooking").post(InitiateBookings);
BookingRouter.route("/User/ApplyOffer").post(ApplyOffer);
BookingRouter.route("/User/VerifyUserDuringPayment").post(verifyUserDuringpayment);
BookingRouter.route("/User/ConfirmBooking").post(ConfirmBooking);
BookingRouter.route("/User/paymentVerify").post(paymentVerify);
BookingRouter.route("/User/GetCalcualteFinalPrice").post(GetCalcualteFinalPrice);





module.exports={
    BookingRouter
}