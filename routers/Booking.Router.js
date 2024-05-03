const express=require("express");
const BookingRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const {InitiateBookings,ApplyOffer,verifyUserDuringpayment,ConfirmBooking,paymentVerify,GetCalcualteFinalPrice}=require("../controllers/Booking.Controller")



BookingRouter.route("/User/InitiateBooking").post(Authentication,InitiateBookings);
BookingRouter.route("/User/ApplyOffer").post(Authentication,ApplyOffer);
BookingRouter.route("/User/VerifyUserDuringPayment").post(Authentication,verifyUserDuringpayment);
BookingRouter.route("/User/ConfirmBooking").post(Authentication,ConfirmBooking);
BookingRouter.route("/User/paymentVerify").post(Authentication,paymentVerify);
BookingRouter.route("/User/GetCalcualteFinalPrice").post(Authentication,GetCalcualteFinalPrice);





module.exports={
    BookingRouter
}