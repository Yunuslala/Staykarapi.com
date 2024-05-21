
const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { BookingModel } = require("../models/Booking.model");
const { OfferModel } = require("../models/Offer.model");
const { ErrorHandler } = require("../utils/Error.Handler");
const { UserModel } = require("../models/User.model");
const env = require("../config/env");
const crypto = require('crypto');
const { PaymentModel } = require("../models/Payment.Model");
const { generateRandomNumber, generateRandomString } = require("../utils/RandomNumber");
const { SendOTPmail, sendPaymentSuccessEmail } = require("../utils/SentMail");
const razorpay = require("razorpay");
const { error } = require("console");
const { ProfileModel } = require("../models/Profile.Model");
const moment = require("moment-timezone");
const bcrypt=require("bcrypt");
const { RoomModel } = require("../models/RoomModel");
const { v4: uuidv4 } = require('uuid');

exports.InitiateBookings = AsyncerrorHandler(async (req, res, next) => {
  const {
    basePrice,
    numberOfGuests,
    numberOfRooms,
    checkInDate,
    checkOutDate,
  } = req.body;
  const priceDetails = await CalculatePrice(
    basePrice,
    numberOfGuests,
    numberOfRooms,
    checkInDate,
    checkOutDate
  );
  return res
    .status(200)
    .send({ success: true, msg: "Calculated money", data: priceDetails });
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
  let priceHike = 0;
  if (numberOfGuests > totalCapacity) {
    const additionalGuests = numberOfGuests - totalCapacity;
    console.log("additionalGuests", additionalGuests);
    const additionalRoomsNeeded = Math.ceil(additionalGuests / fixedGuestsPerRoom);
    console.log("additionalRoomsNeeded", additionalRoomsNeeded);
    const basePriceHike = basePrice * priceIncreaseDefault * additionalRoomsNeeded;
    priceHike = basePriceHike;
    totalPrice += basePriceHike; // Corrected line: Apply the hike only once
  }
  const gstAmount = totalPrice * gstRate;
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
    priceHike,
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
  const findUser = await UserModel.findOne({ email });
  if (findUser) {
    return res.status(200).send({ success: true, "msg": "User is already present go for login", data: findUser })
  }
  console.log("req", req.body);
  const password = generateRandomString(6);
  const hash=await bcrypt.hash(password,10);
  const registeredUser = new UserModel({ name, email, password:hash, phoneNumber });
  await registeredUser.save();
  const FindProfile = await ProfileModel.findOne({ 'UserId': registeredUser._id });
  if (!FindProfile) {
    const createProfile = new ProfileModel({ UserId: registeredUser._id });
    await createProfile.save();
    await UserModel.findOneAndUpdate({ 'UserId': registeredUser._id }, { profileId: createProfile._id }, { new: true })
  } else {
    await ProfileModel.findOneAndUpdate({ 'UserId': registeredUser._id }, { UserId: registeredUser._id }, { new: true })
    await UserModel.findOneAndUpdate({ 'UserId': registeredUser._id }, { profileId: FindProfile._id }, { new: true })

  }

  const random = generateRandomNumber(4);
  const sentOtp = await SendOTPmail(registeredUser,password, random, res);
});

exports.ConfirmBooking = AsyncerrorHandler(async (req, res, next) => {
  const { method, priceHike, UserId, HotelId, roomsId, gstAmount, totalPrice, StartingDate, EndDate, appliedOfferId, finalPrice, basePrice, numberOfGuests, numberOfRooms, offerDiscountMoney } = req.body;
  const findUser = await UserModel.findOne({ _id: UserId });
  if (!findUser) {
    return next(new ErrorHandler(401, "Verify yourself for booking"));
  }
  const numberOfNights = Math.ceil(
    (new Date(EndDate) - new Date(StartingDate)) / (1000 * 60 * 60 * 24)
  );
  const startDate = moment(StartingDate).startOf('day');
  const endDate = moment(EndDate).endOf('day');
  const existingBookings = await BookingModel.find({
    roomsId: roomsId,
    isCanceled: false,
    $or: [
      { StartingDate: { $lte: endDate.toDate() }, EndDate: { $gte: startDate.toDate() } },
      { StartingDate: { $lte: startDate.toDate() }, EndDate: { $gte: endDate.toDate() } }
    ]
  });
  if (existingBookings.length > 0) {
    return next(new ErrorHandler(400, "The room is already booked for the selected dates"));
  }
  const bookingDate = moment().format('YYYYMMDD');
  const bookingUUID = uuidv4().split('-')[0].toUpperCase();
  const bookingnumber = `BOOK-${bookingDate}-${bookingUUID}`;

  const InitiateBooking = new BookingModel({ priceHike, bookingnumber, duration: numberOfNights, AppliedOfferId: appliedOfferId, UserId, HotelId, roomsId: roomsId, gstAmount, totalPrice, StartingDate, EndDate, appliedOfferId, finalPrice, basePrice, numberOfGuests, numberOfRooms, offerDiscountMoney })
  InitiateBooking.save();
  const currentDateTime = moment();
  const bookingStartDateTime = moment(StartingDate).startOf('day').add(11, 'hours'); // Check-in time at 11:00 AM
  const timeDifference = bookingStartDateTime.diff(currentDateTime);
  if (timeDifference <= 3600000) {
    // If the booking start date is within the next hour, update room availability immediately
    await RoomModel.findOneAndUpdate({ _id: InitiateBooking?.roomsId }, { isAvaliable: false }, { new: true });
    console.log("Room availability updated for room:", InitiateBooking?.roomsId);
  } else {
    // Schedule a job to update the room availability one hour before check-in time using setTimeout
    setTimeout(async () => {
      await RoomModel.findOneAndUpdate({ _id: InitiateBooking?.roomsId }, { isAvaliable: false }, { new: true });
      console.log("Scheduled job: Room availability updated for room:", InitiateBooking?.roomsId);
    }, timeDifference - 3600000); // One hour before check-in
  }
  if (method == "Cash On site") {
    const confirmThePayment = new PaymentModel({
      BookingId: InitiateBooking._id,
      paymentMode: method,
    });
    await confirmThePayment.save();
    const createBooking = await BookingModel.findByIdAndUpdate(
      { _id: InitiateBooking?._id },
      {
        isBooked: true,
        UserId,
        paymentId: confirmThePayment._id,
      },
      { new: true }
    );
    console.log("CreateBooking", createBooking);
    const profiledata = await ProfileModel.findOneAndUpdate(
      { UserId: UserId }, // Find the profile based on UserId
      { $push: { 'MyBookings': { BookingId: createBooking?._id } } }, // Push the new BookingId to MyBookings array
      { new: true }
    );
    console.log("CreateBooking", profiledata);
    const findThisHotelRoom=await RoomModel.findOneAndUpdate({_id:HotelId},{isAvaliable:false},{new:true});
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
        console.log("error", error);
        return next(new ErrorHandler(400, "Server Invalid"));
      }
      try {
        const InitiatePayment = new PaymentModel({
          BookingId: InitiateBooking?._id,
          paymentMode: method,
          razorpay_order_id: order.id,
        });
        await InitiatePayment.save();
        // await generateAndSend_pdf(res, Booking
        console.log("orderofRozerpay", order);
        return res.status(200).send({
          msg: "Rozer Payment Initiated successfully",
          order,
          bookingId: InitiateBooking?._id,
          razkey: env.RAZOR_PAY_KEY_ID,
        });
      } catch (error) {
        return next(new ErrorHandler(400, `${error.message}`));
      }
    });
  }
});




exports.paymentVerify = AsyncerrorHandler(async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const generated_signature = crypto
      .createHmac("sha256", 'ztRFhmrQCyvqnPI02Q8cm5P0')
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");
    if (generated_signature === razorpay_signature) {
      const payment_date = new Date();
      const paymentInfoUpdate = await PaymentModel.findOneAndUpdate(
        { BookingId: req.query.BookingId },
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
      const updateBooking = await BookingModel.findByIdAndUpdate(
        req.query.BookingId,
        {
          paymentId: paymentInfoUpdate._id,
          isBooked: true,
        },
        { new: true }
      );
      const profiledata = await ProfileModel.findOneAndUpdate(
        { UserId: updateBooking?.UserId },
        { $push: { 'MyBookings': { BookingId: updateBooking?._id } } }, 
        { new: true }
      );
      const currentDateTime = moment();
      const bookingStartDateTime = moment(StartingDate).startOf('day').add(11, 'hours'); // Check-in time at 11:00 AM
      const timeDifference = bookingStartDateTime.diff(currentDateTime);
      if (timeDifference <= 3600000) {
        // If the booking start date is within the next hour, update room availability immediately
        await RoomModel.findOneAndUpdate({ _id: updateBooking?.roomsId }, { isAvaliable: false }, { new: true });
        console.log("Room availability updated for room:", updateBooking?.roomsId);
      } else {
        // Schedule a job to update the room availability one hour before check-in time using setTimeout
        setTimeout(async () => {
          await RoomModel.findOneAndUpdate({ _id: updateBooking?.roomsId }, { isAvaliable: false }, { new: true });
          console.log("Scheduled job: Room availability updated for room:", updateBooking?.roomsId);
        }, timeDifference - 3600000); // One hour before check-in
      }
      await sendPaymentSuccessEmail(updateBooking, res);
    } else {
      return res.status(400).send({ message: "Invalid signature" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Internal server error" });
  }
});


exports.GetAllBookings = AsyncerrorHandler(async (req, res, next) => {
  const getBookings = await BookingModel.find({isCanceled:false}).populate('UserId').populate('HotelId').populate('roomsId').populate('AppliedOfferId').populate('paymentId');;
  if (!getBookings.length) return next(new ErrorHandler(404, "Bookings does not exist"))

  return res.status(200).send({ msg: "All Bookings dispersed", data: getBookings });
})

exports.GetUsersBooking = AsyncerrorHandler(async (req, res, next) => {
  const getBookings = await BookingModel.find({ UserId: req.params.id,isCanceled:false }).populate('UserId').populate('HotelId').populate('roomsId').populate('AppliedOfferId').populate('paymentId');;
  if (!getBookings.length) return next(new ErrorHandler(404, "Bookings does not exist"))
  return res.status(200).send({ msg: "All Bookings dispersed", data: getBookings });
})

exports.UseractiveandpastBooking = AsyncerrorHandler(async (req, res) => {
  const userId = req.params.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set time to start of day
  const bookings = await BookingModel.find({ UserId: userId,isCanceled:false }).populate('UserId').populate('HotelId').populate('roomsId').populate('AppliedOfferId').populate('paymentId');
  if (!bookings.length) {
    return next(new ErrorHandler(404, "No hotels exist for you"))
  }
  const activeBookings = [];
  const pastBookings = [];
  bookings.forEach(booking => {
    const endDate = new Date(booking.EndDate);
    endDate.setHours(0, 0, 0, 0); // Set time to start of day
    if (endDate >= today) {
      activeBookings.push(booking);
    } else {
      pastBookings.push(booking);
    }
  });
  const data = {
    activeBookings, pastBookings
  }
  return res.status(200).send({ success: true, msg: "User bookings informations", data });
})

exports.GetBookingLatest = AsyncerrorHandler(async (req, res, next) => {
  const today = moment().tz("Asia/Kolkata").startOf('day');
  const bookings = await BookingModel.find({ UserId: req.params.id })
  if (!bookings.length) {
    return res.status(404).send({ error: "Bookings do not exist" });
  }
  const todayBookings = await BookingModel.find({
    createdAt: {
      $gte: today.toDate(), // Start of today
      $lt: moment(today).endOf('day').toDate() // End of today
    }, UserId: req.params.id,isCanceled:false,
  }).sort({ timestamp: -1 }).populate('UserId').populate('HotelId').populate('roomsId').populate('AppliedOfferId').populate('paymentId');

  // Find bookings created in this month excluding today
  const thisMonthBookings = await BookingModel.find({
    createdAt: {
      $lt: today.toDate() // Before today
    }, UserId: req.params.id,
  }).sort({ timestamp: -1 }).populate('UserId').populate('HotelId').populate('roomsId').populate('AppliedOfferId').populate('paymentId');


  const data = {
    todayBookings,
    thisMonthBookings
  }

  return res.status(200).send({ success: true, msg: "All Bookings dispersed", data });


})

exports.CancelBooking= AsyncerrorHandler(async (req, res, next) => {
  const {UserId,BookingId}=req.body; 
  const getBookings = await BookingModel.findOne({UserId,_id:BookingId,isCanceled:false});
  if (!getBookings) return next(new ErrorHandler(404, "Bookings does not exist"))
    const UpdateBooking=await BookingModel.findOneAndUpdate({_id:BookingId,UserId},{
  isCanceled:true,
  },{new:true});
  if (!UpdateBooking) return next(new ErrorHandler(500, "Error cancelling the booking"));

  // Update the room availability
  const updateRoom = await RoomModel.findOneAndUpdate(
    { _id: UpdateBooking.roomsId },
    { isAvaliable: true },
    { new: true }
  );

  if (!updateRoom) return next(new ErrorHandler(500, "Error updating room availability"));
  await SendBookingCancellationEmails(BookingId,res)
})