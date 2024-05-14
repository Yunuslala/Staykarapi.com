const express=require("express");
const BookingRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const {InitiateBookings,ApplyOffer,verifyUserDuringpayment,ConfirmBooking,paymentVerify,GetCalcualteFinalPrice, GetAllBookings, GetUsersBooking, UseractiveandpastBooking, GetBookingLatest, CancelBooking}=require("../controllers/Booking.Controller")



BookingRouter.route("/User/InitiateBooking").post(InitiateBookings);
BookingRouter.route("/User/ApplyOffer").post(ApplyOffer);
BookingRouter.route("/User/VerifyUserDuringPayment").post(verifyUserDuringpayment);
BookingRouter.route("/User/ConfirmBooking").post(ConfirmBooking);
BookingRouter.route("/User/paymentVerify").post(paymentVerify);
BookingRouter.route("/User/GetCalcualteFinalPrice").post(GetCalcualteFinalPrice);
BookingRouter.route("/User/GetAllBookings").get(GetAllBookings);
BookingRouter.route("/User/Bookings/:id").get(GetUsersBooking);
BookingRouter.route("/User/ActivPastBookings/:id").get(UseractiveandpastBooking);
BookingRouter.route("/User/GetBookingLatest/:id").get(GetBookingLatest);
BookingRouter.route("/User/CancelBooking").post(CancelBooking);






module.exports={
    BookingRouter
}