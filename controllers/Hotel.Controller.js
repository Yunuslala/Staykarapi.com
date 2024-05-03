const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { HotelModel } = require("../models/Hotel.model");
const { LocationsModel } = require("../models/Locations.model");
const { ReviewModel } = require("../models/Review.model");
const { RoomModel } = require("../models/RoomModel");
const { ErrorHandler } = require("../utils/Error.Handler");
const { uploadMedia } = require("../utils/s3Config");

exports.AddRooms = AsyncerrorHandler(async (req, res, next) => {
  const { Capacity, roomsType, Price, role } = req.body;
  if (role != "admin") {
    return next(new ErrorHandler(400, "You are not authorized for this route"));
  }
  let fileUrls = [];
  if (req.files && req.files.length > 0) {
    // Map the array of files to an array of promises returned by uploadMedia
    const uploadPromises = req.files.map(async (item) => {
      try {
        const { key, imageUrl } = await uploadMedia(item.path, item.mimetype);
        return { key, imageUrl };
      } catch (err) {
        console.error("Error uploading media:", err);
        return next(new ErrorHandler(400, "Error in uploading rooms Image"));
      }
    });
    const uploadedFiles = await Promise.all(uploadPromises);
    fileUrls = uploadedFiles.filter(Boolean);
  }

  const CreateRoom = new RoomModel({
    Capacity,
    roomsType,
    Price,
    roomImages: fileUrls,
  });
  await CreateRoom.save();
  return res.status(201).send({
    success: true,
    msg: "Room is created",
    data: CreateRoom,
  });
});

exports.RegisteredHotel = AsyncerrorHandler(async (req, res, next) => {
  const {
    role,
    Hotelname,
    address,
    longitude,
    latitude,
    description,
    Categories,
    Ameneties,
    hotelRooms,
    email,
    phoneNumber,
    LocationId,
    
  } = req.body;
  const findExisting=await HotelModel.findOne({Hotelname});
  if(findExisting){
    return res.status(200).send({success:true,msg:"Hotel is already exist",data:findExisting});
  }
  const amenetyObj=[];
  Ameneties.map((item)=>amenetyObj.push({amenityId:item}));
  const categryObj=[];
  Categories.map((item)=>categryObj.push({CategoryId:item}));
 
  if (role != "admin") {
    return next(new ErrorHandler(400, "You are not authorized for this route"));
  }
  let fileUrls = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map(async (item) => {
      try {
        const { key, imageUrl } = await uploadMedia(item.path, item.mimetype);
        return { key, imageUrl };
      } catch (err) {
        console.error("Error uploading media:", err);
        return next(new ErrorHandler(400, "Error in uploading rooms Image"));
      }
    });
    const uploadedFiles = await Promise.all(uploadPromises);
    fileUrls = uploadedFiles.filter(Boolean);
  }
  console.log(fileUrls)
  const hotelsave = new HotelModel({
    Hotelname,
    address,
    longitude,
    latitude,
    description,
    email,
    phoneNumber,
    Categories:categryObj,
    Ameneties:amenetyObj,
    hotelRooms,
    LocationId,
    hotelImgaes: fileUrls,
  });
  await hotelsave.save();
  const roomsave=new RoomModel({hotelId:hotelsave._id});
  await roomsave.save()
  // await RoomModel.findByIdAndUpdate(
  //   { _id: hotelRooms },
  //   {
  //     hotelId: hotelsave._id,
  //   }
  // );
  return res.status(201).send({
    success: true,
    msg: "Hotel has been added",
    data:hotelsave
  });
});

exports.AddExtraRooms = AsyncerrorHandler(async (req, res, next) => {
  const { Capacity, roomsType, Price,roomsQuantity, role, hotelId } = req.body;
  if (role != "admin") {
    return next(new ErrorHandler(400, "You are not authorized for this route"));
  }
  const findExistRoomsForHotel=await RoomModel.findOne({hotelId,roomsType});
  if(findExistRoomsForHotel){
    return next(new ErrorHandler(400,"This type room is already exist if you want add more this type so increase quanitity of this hotel itsef"))
  }
  let fileUrls = [];
  if (req.files && req.files.length > 0) {
    // Map the array of files to an array of promises returned by uploadMedia
    const uploadPromises = req.files.map(async (item) => {
      try {
        const { key, imageUrl } = await uploadMedia(item.path, item.mimetype);
        return { key, imageUrl };
      } catch (err) {
        console.error("Error uploading media:", err);
        return next(new ErrorHandler(400, "Error in uploading rooms Image"));
      }
    });
    const uploadedFiles = await Promise.all(uploadPromises);
    fileUrls = uploadedFiles.filter(Boolean);
  }
  console.log("filerooms",fileUrls)
  const createRoom = new RoomModel({
    Capacity,
    roomsType,
    Price,
    roomImages: fileUrls,
    hotelId,
    roomsQuantity
  });
  await createRoom.save();
  const addRoomsInHotel = await HotelModel.findByIdAndUpdate(
    { _id: hotelId },
    {
      $push: {
        hotelRooms: {
          roomsId: createRoom._id,
        },
      },
    },
    { new: true }
  ).populate("hotelRooms.roomsId");
  return res
    .status(201)
    .send({
      success: true,
      msg: "room has been added in hotel",
      data: addRoomsInHotel,
    });
});

exports.GetAllHotel = AsyncerrorHandler(async (req, res, next) => {
  const AllHotel = await HotelModel.find()
    .populate("hotelRooms.roomsId")
    .populate("Categories.CategoryId")
    .populate('Reviews.ReviewId')
    .populate('LocationId')
    .populate('Ameneties.amenityId')
  if (!AllHotel.length) {
    return next(new ErrorHandler(404,"Hotels does not exist"))
  }
  return res.status(200).send({success:true,msg:"All hotels",data:AllHotel})
});

exports.addReview=AsyncerrorHandler(async(req,res,next)=>{
    const {UserId,HotelId,text,ratings}=req.body;
    let fileUrls = [];
    if (req.files && req.files.length > 0) {
      // Map the array of files to an array of promises returned by uploadMedia
      const uploadPromises = req.files.map(async (item) => {
        try {
          const { key, imageUrl } = await uploadMedia(item.path, item.mimetype);
          return { key, imageUrl };
        } catch (err) {
          console.error("Error uploading media:", err);
          return next(new ErrorHandler(400, "Error in uploading rooms Image"));
        }
      });
      const uploadedFiles = await Promise.all(uploadPromises);
      fileUrls = uploadedFiles.filter(Boolean);
    }
    const createReview=new ReviewModel({
      UserId,HotelId,text,ratings,ReviewImages:fileUrls
    })
    const findHotelReviews = await ReviewModel.find({
        HotelId
      });
      let CalculateRatings = 0;
      findHotelReviews.forEach((item) => {
        CalculateRatings += Number(item.ratings);
      });
  
      const AverageRating =
        (CalculateRatings + Number(req.body.ratings)) / (findHotelReviews.length + 1);
      const findHotel = await HotelModel.findByIdAndUpdate(
        { _id: HotelId },
        {
          $push: { 'Reviews': { ReviewId: createReview._id}},
          $inc: {NumberOfReviews: 1 },
          $set: { Ratings: AverageRating },
        },
        {new:true}
      );
      return res.status(201).send({success:true,msg:"Review has been added",data:findHotel})
})

exports.getSingleHotel=AsyncerrorHandler(async(req,res,next)=>{
  const Hotelname=req.params.id;
  console.log(Hotelname)
  const AllReviews=await HotelModel.findOne({Hotelname})
  .populate("hotelRooms.roomsId")
  .populate("Categories.CategoryId")
  .populate('Reviews.ReviewId')
  .populate('LocationId')
  .populate('Ameneties.amenityId');
  console.log(AllReviews);
  if(!AllReviews){
    return next(new ErrorHandler(404,"Reviews does not exist for this hotel"))
  }
  return res.status(200).send({success:true,msg:"Single Hotel details",data:AllReviews});
})

exports.DeleteSingleHotel=AsyncerrorHandler(async(req,res,next)=>{
  const Hotelname=req.params.id;
  const {role}=req.body;
  if(role!='admin'){
    return next(new ErrorHandler(401,"You are not authorised"))
  }
  const AllReviews=await HotelModel.findOne({Hotelname});
  if(!AllReviews.length){
    return next(new ErrorHandler(404,"Reviews does not exist for this hotel"))
  }
  await ReviewModel.deleteMany({HotelId:AllReviews._id});
  await HotelModel.findByIdAndDelete({_id:HotelId});
  return res.status(200).send({success:true,msg:"Hotel is deleted"});
})

exports.GetHotelsByLocations=AsyncerrorHandler(async(req,res,next)=>{
  const Locations=req.params.id;
  const findlocation=await LocationsModel.findOne({location:Locations});
  if(!findlocation){
    return next(new ErrorHandler(404,"Locations does not exist"));
  }
  const getLocationHotels=await HotelModel.find({LocationId:findlocation._id});
  if(!getLocationHotels.length){
    return next(new ErrorHandler(404,"for this Location hotels does not exist"));
  }
  return res.status(200).send({success:true,msg:`available hotels for ${Locations}`})
})

