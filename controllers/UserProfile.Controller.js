const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { BookingModel } = require("../models/Booking.model");
const { HotelModel } = require("../models/Hotel.model");
const { ProfileModel } = require("../models/Profile.Model");
const { RoomModel } = require("../models/RoomModel");
const { UserModel } = require("../models/User.model");
const { ErrorHandler } = require("../utils/Error.Handler");


exports.ProfileDetails = AsyncerrorHandler(async (req, res, next) => {
  const { email } = req.body;
  const FindUser=await UserModel.findOne({email})
  const userProfile = await ProfileModel.findOne({UserId:FindUser?._id,isDeleted:false})
  .populate("FavouriteBlogs.blogId")
  .populate("UserId")
  .populate("FavouriteHotels.HotelId")
  .populate({
    path: "MyBookings.BookingId",
    match: { isCanceled: false },
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
  const { UserId,isfavourite } = req.body;
  const blogId=req.params.id;
  const findProfile = await ProfileModel.findOne({ UserId });
  if (!findProfile) {
    return next(new ErrorHandler(404, "Profile does not exist"));
  }
  console.log("here1")
  const findAlreadyAdded=await ProfileModel.findOne({UserId,'FavouriteBlogs.blogId':blogId})
  if(isfavourite){
    const findAndUpdate = await ProfileModel.findByIdAndUpdate(
      { _id: findProfile._id },
      {
        $pull: {
          FavouriteBlogs: {
            blogId,
          },
        },
      },
      { new: true }
    )
    console.log("here4")
    return next(new ErrorHandler(400,"Blog removed from your favourite"))
  }
  if(findAlreadyAdded){
    console.log("hereagain")
  const findAlreadyAddedAgain=await ProfileModel.findOne({UserId,'FavouriteBlogs.blogId':blogId}) 

     return res.status(200).send({success:true,msg:"blog added already in favourite",data:findAlreadyAddedAgain})
    ;
  }
  console.log("here3")

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

exports.getAllProfiles=AsyncerrorHandler(async(req,res,next)=>{
  const Profiles=await ProfileModel.find({isDeleted:false}) .populate("FavouriteBlogs.blogId")
  .populate("FavouriteHotels.hotelId")
  .populate({
    path: "MyBookings.BookingId",
    match: { isCanceled: false },
    populate: {
      path: "paymentId",
    },
  })
  .populate("UserId");
  if(!Profiles.length) return next(new ErrorHandler(404,"Profiles does not exist"))
  return res.status(200).send({success:true,msg:"all profiles of user",data:Profiles})
})

exports.deleteProfile=AsyncerrorHandler(async(req,res,next)=>{
  const FindUserProfile=await ProfileModel.findOne({UserId:req.params.id});
  if(!FindUserProfile) return next(new ErrorHandler(404,"User Profile Does not exist"))
    const deleteUser=await ProfileModel.findOneAndDelete({UserId:req.params.id});
})
  
exports.GetSingleProfile=AsyncerrorHandler(async(req,res,next)=>{
  const FindUserProfile=await ProfileModel.findOne({UserId:req.params.id,isDeleted:false}) .populate("FavouriteBlogs.blogId")
  .populate("FavouriteHotels.hotelId")
  .populate({
    path: "MyBookings.BookingId",
    match: { isCanceled: false },
    populate: {
      path: "paymentId",
    },
  })
  .populate("UserId");
  if(!FindUserProfile) return next(new ErrorHandler(404,"User Profile Does not exist"))
  return res.status(200).send({success:true,"msg":"Get user Single profile",data:FindUserProfile})
})

