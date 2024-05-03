const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { BookingModel } = require("../models/Booking.model");
const { HotelModel } = require("../models/Hotel.model");
const { ProfileModel } = require("../models/Profile.Model");
const { RoomModel } = require("../models/RoomModel");
const { ErrorHandler } = require("../utils/Error.Handler");


exports.ProfileDetails = AsyncerrorHandler(async (req, res, next) => {
  const { email } = req.body;
  const userProfile = await ProfileModel.findOne({email })
  .populate("FavouriteBlogs.blogId")
  .populate("FavouriteHotels.HotelId")
  .populate({
    path: "MyBookings.BookingId",
    populate: {
      path: "paymentId",
    },
  });
    if(!userProfile) {
        return next(new ErrorHandler(404, "Profile does not exist"));
      }
    return res.status(200).send({
    success: true,
    msg: "Your Profile is Dispersed",
    data: userProfile,
  });
});

exports.AddBlogFavourites = AsyncerrorHandler(async (req, res, next) => {
  const { UserId } = req.body;
  const blogId=req.params.id;
  const findProfile = await ProfileModel.findOne({ UserId });
  if (!findProfile) {
    return next(new ErrorHandler(404, "Profile does not exist"));
  }
  const findAndUpdate = await ProfileModel.findByIdAndUpdate(
    { _id: findProfile._id },
    {
      $push: {
        FavouriteBlogs: {
          blogId,
        },
      },
    },
    { new: true }
  )
  .populate("FavouriteBlogs.blogId")
  .populate("FavouriteHotels.hotelId")
  .populate("MyBookings.bookingId");

  return res.status(200).send({success:true,msg:"blog added in favourite",data:findAndUpdate})
});

exports.AddHotelFavourites = AsyncerrorHandler(async (req, res, next) => {
    const { UserId } = req.body;
    const hotelId=rea.params.id
    const findProfile = await ProfileModel.findOne({ UserId });
    if (!findProfile) {
      return next(new ErrorHandler(404, "Profile does not exist"));
    }
    const findAndUpdate = await ProfileModel.findByIdAndUpdate(
      { _id: findProfile._id },
      {
        $push: {
          FavouriteHotels: {
            hotelId,
          },
        },
      },
      { new: true }
    )
    .populate("FavouriteBlogs.blogId")
    .populate("FavouriteHotels.hotelId")
    .populate("MyBookings.bookingId");
    return res.status(200).send({success:true,msg:"blog added in favourite",data:findAndUpdate})
});
  
