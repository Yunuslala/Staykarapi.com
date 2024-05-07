const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { HotelModel } = require("../models/Hotel.model");
const { LocationsModel } = require("../models/Locations.model");
const { ReviewModel } = require("../models/Review.model");
const { RoomModel } = require("../models/RoomModel");
const { ErrorHandler } = require("../utils/Error.Handler");
const { uploadMedia } = require("../utils/s3Config");

exports.AddRooms = AsyncerrorHandler(async (req, res, next) => {
  const { Capacity, roomsType, Price, role,roomsQuantity } = req.body;
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

  const CreateRoom =new RoomModel({
    Capacity,
    roomsType,
    Price,
    roomImages: fileUrls,
    roomsQuantity
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
 const roomobj=[];
 hotelRooms.map((item)=>roomobj.push({roomsId:item}))
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
    hotelRooms:roomobj,
    LocationId,
    hotelImgaes: fileUrls,
  });
  await hotelsave.save();
  
  await RoomModel.findByIdAndUpdate(
    { _id: hotelRooms },
    {
      hotelId: hotelsave._id,
    }
  );
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

exports.GetAllHotel = async (req, res, next) => {
  const { locations, amenities, sort } = req.query;
  
  try {
    let filterCriteria = {};

    if (locations!=undefined && locations.length > 0) {
      const locationIds = await getLocationIds(locations);
      filterCriteria['LocationId'] = { $in: locationIds };
    }

 
    if (amenities!=undefined && amenities.length > 0) {
      const amenityIds = await getAmenityIds(amenities);
      filterCriteria['Ameneties.amenityId'] = { $in: amenityIds };
    }


    // Construct the query to fetch hotels
    let query = HotelModel.find(filterCriteria)
      .populate("hotelRooms.roomsId")
      .populate("Categories.CategoryId")
      .populate('Reviews.ReviewId')
      .populate('LocationId')
      .populate('Ameneties.amenityId')
      .populate('offers.offerId');

    // If sorting parameter is provided
    if (sort!=undefined) {
      console.log("objectofsort",sort);
      switch (sort) {
        case 'priceAsc':
          query = query.sort({ 'hotelRooms.roomsId.Price': 1 });
          break;
        case 'priceDesc':
          query = query.sort({ 'hotelRooms.roomsId.Price': -1 });
          break;
        case 'ratingAsc':
          query = query.sort({ 'Ratings': 1 });
          break;
        case 'ratingDesc':
          query = query.sort({ 'Ratings': -1 });
          break;
        // Add more conditions for other sorting parameters if needed
        default:
          // Handle invalid sorting parameter
          return res.status(400).json({ success: false, msg: "Invalid sorting parameter" });
      }
    }

    const AllHotel = await query;

    if (!AllHotel.length) {
      return res.status(404).json({ success: false, msg: "Hotels do not exist" });
    }

    let highestPrice = 0;
    let lowestPrice = Infinity;
    console.log("allhotels",AllHotel[0].hotelRooms);
    // Calculate highest and lowest prices
    AllHotel.forEach(hotel => {
      hotel.hotelRooms.forEach(item => {
        if (item.roomsId.Price > highestPrice) {
          highestPrice = item.roomsId.Price;
        }
        if (item.roomsId.Price < lowestPrice) {
          lowestPrice = item.roomsId.Price;
        }
      });
    });
    console.log("highestprice",highestPrice,lowestPrice);

    const hoteldata = {
      data: AllHotel,
      lowestPrice,
      highestPrice,
      hotelLength: AllHotel.length
    };
    return res.status(200).json({ success: true, msg: "All hotels", data: hoteldata });
  } catch (error) {
    return next(error);
  }
};

exports.searchHotel = async (req, res, next) => {
  try {
    const { location, from, to, persons, rooms } = req.body;

    // Search hotels based on location
    const locations = await LocationsModel.find({ 'location': location });
    const hotels=await HotelModel.find({LocationId:locations?._id});
    if(!hotels.length){
      return next(new ErrorHandler(404,"hotels Does not exist for this locations"))
    }
    // Filter hotels based on availability of rooms
    const availableHotels = await Promise.all(hotels.map(async (hotel) => {
      const availableRooms = await RoomModel.find({
        'hotelId': hotel._id,
        'isAvailable': true,
      });

      const filteredRooms = availableRooms.filter(room => {
        // Check if room capacity is enough for persons
        if (persons <= 3) {
          return room.Capacity >= persons;
        } else {
          // If persons > 3, check if the room quantity is sufficient
          const requiredRooms = Math.ceil(persons / 3); // Calculate required number of rooms
          return room.roomsQuantity >= requiredRooms;
        }
      });

      return { hotel, filteredRooms };
    }));

    // Filter hotels based on required number of rooms
    const filteredHotels = availableHotels.filter(({ availableRooms }) => availableRooms >= rooms);

   return  res.status(200).send({success:true,data: filteredHotels });
  } catch (error) {
    next(error);
  }
};

// Helper function to find location IDs
async function getLocationIds(locations) {
  const locationIds = await LocationsModel.find({ location: { $in: locations } }).distinct('_id');
  return locationIds;
}

// Helper function to find amenity IDs
async function getAmenityIds(amenities) {
  const amenityIds = await AmenetiesModel.find({ text: { $in: amenities } }).distinct('_id');
  return amenityIds;
}


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

exports.getSingleHotel = AsyncerrorHandler(async (req, res, next) => {
  const Hotelname = req.params.id;
  const roomtype = req.query.type;
  
  try {
    const singleHotel = await HotelModel.findOne({ Hotelname })
      .populate('hotelRooms.roomsId')
      .populate('Categories.CategoryId')
      .populate('Reviews.ReviewId')
      .populate('LocationId')
      .populate('offers.offerId')
      .populate('Ameneties.amenityId')
      .exec();

    if (!singleHotel) {
      return next(new ErrorHandler(404, "Hotel not found"));
    }

    // Filter rooms by roomtype if specified
    console.log("roomtype",roomtype);
    if (roomtype) {
      // Filter rooms by roomtype if specified
    console.log("roomtypeagain",roomtype);

      singleHotel.hotelRooms = singleHotel.hotelRooms.filter((room) => {
        return room.roomsId.roomsType === roomtype;
      });
    
      // Check if there are no rooms matching the specified type
      if (singleHotel.hotelRooms.length === 0) {
        singleHotel.hotelRooms = []; // Set hotelRooms to an empty array
      }
    }else{
      singleHotel.hotelRooms = []; 
    }
    
    

   return res.status(200).json({
      success: true,
      msg: "Single Hotel details",
      data: singleHotel,
    });
  } catch (error) {
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});




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

