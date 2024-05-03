
const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { BookingModel } = require("../models/Booking.model");
const { OfferModel } = require("../models/Offer.model");
const { ErrorHandler } = require("../utils/Error.Handler");
const { UserModel } = require("../models/User.model");
const env =require( "../config/env");
const { PaymentModel} =require("../models/Payment.Model");
const { generateRandomNumber, generateRandomString} =require("../utils/RandomNumber");
const { SendOTPmail, sendPaymentSuccessEmail} =require("../utils/SentMail");

exports.InitiateBookings = AsyncerrorHandler(async (req, res, next) => {
  const {
    basePrice,
    numberOfGuests,
    numberOfRooms,
    checkInDate,
    checkOutDate,
  } = req.body;
  console.log("body",req.body)
  const priceDetails=await CalculatePrice(
    basePrice,
    numberOfGuests,
    numberOfRooms,
    checkInDate,
    checkOutDate
  );
  console.log("dates",priceDetails);
  return res
    .status(200)
    .send({ success: true, msg: "Calculated money",data:priceDetails });
});
exports.GetCalcualteFinalPrice = AsyncerrorHandler(async (req, res, next) => {
  const {
    basePrice,
    numberOfRooms,
    numberOfGuests,
    checkInDate,
    checkOutDate,
    BookingId,
  } = req.body;
  const priceDetails = CalculatePrice(
    basePrice,
    numberOfGuests,
    numberOfRooms,
    checkInDate,
    checkOutDate
  );
  const updateData = await BookingModel.findByIdAndUpdate(
    { _id: BookingId },
    {
      numberOfGuests,
      numberOfRooms,
      basePrice,
      StartingDate: checkInDate,
      EndDate: checkOutDate,
      gstAmount: priceDetails?.gstAmount,
      totalPrice: priceDetails?.totalPrice,
      finalPrice: priceDetails?.finalPrice,
    },
    { new: true }
  );
  return res
    .status(200)
    .send({ success: true, msg: "Price is updated", data: updateData });
});
const CalculatePrice = async (
  basePrice,
  numberOfGuests,
  numberOfRooms,
  checkInDate,
  checkOutDate,
  OfferId,
  perPersonCapacity,
  priceIncreasePercentage // New parameter for dynamic base price hike percentage
) => {
  const gstRate = 0.12; // 12% GST rate
  const perNightPrice = basePrice;
  const priceIncreaseDefault = priceIncreasePercentage || 0.3;
  const fixedGuestsPerRoom = perPersonCapacity || 2; // Default per person capacity for room
  const numberOfNights = Math.ceil(
    (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
  );
  const totalCapacity = fixedGuestsPerRoom * numberOfRooms;
  let totalPrice = perNightPrice * numberOfNights * numberOfRooms;
  
 if (numberOfGuests > totalCapacity) {
  const additionalGuests = numberOfGuests - totalCapacity;
  console.log("additionalGuests", additionalGuests);
  const additionalRoomsNeeded = Math.ceil(additionalGuests / fixedGuestsPerRoom);
  console.log("additionalRoomsNeeded", additionalRoomsNeeded);
  const basePriceHike = basePrice * priceIncreaseDefault * additionalRoomsNeeded;
  console.log("basePriceHike", basePriceHike);
  totalPrice += basePriceHike; // Corrected line: Apply the hike only once
}
  const gstAmount = totalPrice * gstRate ;
  let finalPrice = totalPrice + gstAmount;
  let offerDiscountMoney;
  const getOffer = await OfferModel.findOne({
    _id: OfferId,
  });
  if (getOffer) {
    const discount = getOffer.discount.split("%");
    const discountPer = Number(discount[0]);
    const offerDiscount = finalPrice * (discountPer / 100);
    offerDiscountMoney = offerDiscount;
    finalPrice = finalPrice - offerDiscount;
  }
  const priceDetails = {
    totalPrice,
    finalPrice,
    gstAmount,
    offerDiscountMoney,
  };
  console.log("priceDetails", priceDetails);
  return priceDetails;
};





exports.ApplyOffer = AsyncerrorHandler(async (req, res, next) => {
  const { BookingId, OfferId } = req.body;
  const findBookings = await BookingModel.findOne({ _id: BookingId });
  if (!findBookings) {
    return res.status(404).send({
      success: false,
      msg: "Booking Id in invalid",
    });
  }
  const {
    basePrice,
    numberOfRooms,
    numberOfGuests,
    checkInDate: StartingDate,
    checkOutDate: EndDate,
  } = findBookings;
  const { totalPrice, finalPrice, gstAmount, offerDiscountMoney } =
    CalculatePrice(
      basePrice,
      numberOfRooms,
      numberOfGuests,
      checkInDate,
      checkOutDate,
      OfferId
    );

  const updateData = await BookingModel.findByIdAndUpdate(
    { _id: BookingId },
    {
      OfferId,
      offerDiscountMoney,
      numberOfGuests,
      numberOfRooms,
      basePrice,
      StartingDate: checkInDate,
      EndDate: checkOutDate,
      gstAmount,
      totalPrice,
      finalPrice,
    },
    { new: true }
  );

  return res
    .status(200)
    .send({ success: true, msg: "offer applied", data: updateData });
});

exports.verifyUserDuringpayment = AsyncerrorHandler(async (req, res, next) => {
  const { name, email, phoneNumber } = req.body;
  const findUser=await UserModel.findOne({email});
  if(findUser){
    return res.status(200).send({"msg":"User is already present",data:findUser})
  }
  const password=generateRandomString(6);
  const registeredUser = new UserModel(name, email, password, phoneNumber);
  await registeredUser.save();
  const random = generateRandomNumber(4);
  const sentOtp = await SendOTPmail(registeredUser, random, res);
});

exports.ConfirmBooking = AsyncerrorHandler(async (req, res, next) => {
  const {  method, UserId,HotelId,roomsId,gstAmount,totalPrice,StartingDate,EndDate,appliedOfferId,finalPrice,basePrice,numberOfGuests,numberOfRooms,offerDiscountMoney } = req.body;
  const findUser = await UserModel.findOne({ _id: UserId });
  if (!findUser) {
    return next(new ErrorHandler(401, "Verify yourself for booking"));
  }
  const numberOfNights = Math.ceil(
    (new Date(EndDate) - new Date(StartingDate)) / (1000 * 60 * 60 * 24)
  );
  const InitiateBooking=new BookingModel({duration:numberOfNights,UserId,HotelId,roomsId,gstAmount,totalPrice,StartingDate,EndDate,appliedOfferId,finalPrice,basePrice,numberOfGuests,numberOfRooms,offerDiscountMoney})
 InitiateBooking.save();
 
  if (method == "Cash On site") {
    const confirmThePayment = new PaymentModel({
      BookingId:InitiateBooking._id,
      paymentMode: method,
    });
    await confirmThePayment.save();
    const createBooking = await BookingModel.findByIdAndUpdate(
      { _id: InitiateBooking?._id },
      {
        isBooked: true,
        UserId,
        paymentId: confirmThePayment._id,
        isBooked: true,
      },
      { new: true }
    );
    await sendPaymentSuccessEmail(createBooking, res);
  }
   else {
    const instance = new razorpay({
      key_id: env.RAZOR_PAY_KEY_ID,
      key_secret: env.RAZOR_PAY_KEY_SECRATE,
    });
    const options = {
      amount: Number(InitiateBooking?.totalPrice) * 100,
      currency: "INR",
      receipt: "rcp1",
    };
    console.log(options);
    instance.orders.create(options, async (err, order) => {
      if (err) {
        return next(new ErrorHandler(400, "Server Invalid"));
      }
      try {
        const InitiatePayment = new PaymentModel({
          BookingId:InitiateBooking?._id,
          paymentMode: method,
          razorpay_order_id: order.id,
        });
        await InitiatePayment.save();
        // await generateAndSend_pdf(res, Booking
        console.log("orderofRozerpay", order);
        return res.status(200).send({
          msg: "Rozer Payment Initiated successfully",
          order,
          bookingId:InitiateBooking?._id,
          key: config.RAZOR_PAY_KEY_ID,
        });
      } catch (error) {
        return next(new ErrorHandler(400, `${error.message}`));
      }
    });
  }
});

exports.paymentVerify = AsyncerrorHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // Generate the expected signature
    const generated_signature = crypto
      .createHmac("sha256", config.RAZOR_PAY_KEY_SECRATE)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      // Payment is successful, handle the logic here
      // Update payment status to 1
      const payment_date = new Date();
      const paymentInfoUpdate = await PaymentModel.findByIdAndUpdate(
        { _id: req.query.BookingId },
        {
          payment_status: true,
          razorpay_signature,
          razorpay_payment_id,
          razorpay_order_id,
          ispaid: true,
          paymentDate: payment_date,
        },
        { new: true }
      );
      console.log("bookinginfover", bookingInfo);
      const updateBooking = await BookingModel.findByIdAndUpdate(
        { _id: BookingId },
        {
          paymentId: paymentInfoUpdate._id,
          isBooked: true,
        },
        { new: true }
      );
      await sendPaymentSuccessEmail(updateBooking, res);
    } else {
      res.status(400).send({ message: "Invalid signature" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

