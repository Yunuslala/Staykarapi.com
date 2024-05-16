const { default: mongoose } = require("mongoose");
const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { CategoryModel } = require("../models/Categories.Model");
const { HotelModel } = require("../models/Hotel.model");
const { LocationsModel } = require("../models/Locations.model");
const { ReviewModel } = require("../models/Review.model");
const { RoomModel } = require("../models/RoomModel");
const { ErrorHandler } = require("../utils/Error.Handler");
const { uploadMedia } = require("../utils/s3Config");

exports.AddRooms = AsyncerrorHandler(async (req, res, next) => {
  const { Capacity, roomsType, Price, role, roomsQuantity } = req.body;
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
  console.log("req.body", req.body);
  const amenetyObj = [];
  Ameneties?.map((item) => amenetyObj.push({ amenityId: item }));
  const categryObj = [];
  Categories?.map((item) => categryObj.push({ CategoryId: item }));
  const roomobj = [];
  hotelRooms?.map((item) => roomobj.push({ roomsId: item }))
  if (role != "admin") {
    return next(new ErrorHandler(400, "You are not authorized for this route"));
  }
  console.log("categoryobj", categryObj);
  console.log("amenetyObj", amenetyObj);
  console.log("roomobj", roomobj);

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
  const findExisting = await HotelModel.findOne({ Hotelname });
  if (findExisting) {
    const updateHotel = await HotelModel.findOneAndUpdate({ Hotelname }, {
      Hotelname: Hotelname ? Hotelname : findExisting?.Hotelname,
      address: address ? address : findExisting?.address,
      longitude: longitude ? longitude : findExisting?.longitude,
      latitude: latitude ? latitude : findExisting?.latitude,
      description: description ? description : findExisting?.description,
      email: email ? email : findExisting?.email,
      phoneNumber: phoneNumber ? phoneNumber : findExisting?.phoneNumber,
      Categories: categryObj.length ? categryObj : findExisting?.Categories,
      Ameneties: amenetyObj.length ? amenetyObj : findExisting?.Ameneties,
      hotelRooms: roomobj.length ? roomobj : findExisting?.hotelRooms,
      LocationId: LocationId ? LocationId : findExisting?.LocationId,
      hotelImgaes: fileUrls['imageUrl'] ? fileUrls : findExisting?.hotelImgaes,
    }, { new: true })
    return res.status(200).send({ success: true, msg: "Hotel is already exist", data: updateHotel });
  }
  const hotelsave = new HotelModel({
    Hotelname,
    address,
    longitude,
    latitude,
    description,
    email,
    phoneNumber,
    Categories: categryObj,
    Ameneties: amenetyObj,
    hotelRooms: roomobj,
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
    data: hotelsave
  });
});

exports.AddExtraRooms = AsyncerrorHandler(async (req, res, next) => {
  const { Capacity, roomsType, Price, roomsQuantity, role, hotelId } = req.body;
  if (role != "admin") {
    return next(new ErrorHandler(400, "You are not authorized for this route"));
  }
  const findExistRoomsForHotel = await RoomModel.findOne({ hotelId, roomsType });
  if (findExistRoomsForHotel) {
    return next(new ErrorHandler(400, "This type room is already exist if you want add more this type so increase quanitity of this hotel itself"))
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
    if (locations !== undefined && locations.length > 0) {
      const locationIds = await getLocationIds(locations);
      filterCriteria['LocationId'] = { $in: locationIds };
    }
    if (amenities !== undefined && amenities.length > 0) {
      const amenityIds = await getAmenityIds(amenities);
      filterCriteria['Ameneties.amenityId'] = { $in: amenityIds };
    }
    let query = HotelModel.find(filterCriteria)
      .populate("Categories.CategoryId")
      .populate('Reviews.ReviewId')
      .populate('LocationId')
      .populate('Ameneties.amenityId')
      .populate('offers.offerId')
      .populate({
        path: "hotelRooms.roomsId",
        match: { isAvaliable: true }
      });
    if (sort !== undefined) {
      let sortOption = {};
      switch (sort) {
        case 'priceAsc':
          sortOption = { 'hotelRooms.roomsId.Price': 1 };
          break;
        case 'priceDesc':
          sortOption = { 'hotelRooms.roomsId.Price': -1 };
          break;
        case 'ratingAsc':
          sortOption = { 'Ratings': 1 };
          break;
        case 'ratingDesc':
          sortOption = { 'Ratings': -1 };
          break;
        default:
          return res.status(400).json({ success: false, msg: "Invalid sorting parameter" });
      }
      query = query.sort(sortOption);
    }
    const allHotel = await query;
    if (!allHotel.length) {
      return res.status(404).json({ success: false, msg: "Hotels do not exist" });
    }
    let highestPrice = 0;
    let lowestPrice = Infinity;
    allHotel.forEach(hotel => {
      hotel.hotelRooms.forEach(item => {
      });
    });
    allHotel.sort((a, b) => {
      const priceA = a.hotelRooms[0].roomsId.Price;
      const priceB = b.hotelRooms[0].roomsId.Price;
      return priceA - priceB;
    });
    allHotel.forEach(hotel => {
      hotel.hotelRooms.forEach(item => {
        if (item.roomsId.Price > highestPrice) {
          highestPrice = item.roomsId.Price;
        }
        if (item.roomsId.Price < lowestPrice) {
          lowestPrice = item.roomsId.Price;
        }
      });
    });
    const hotelData = {
      data: allHotel,
      lowestPrice,
      highestPrice,
      hotelLength: allHotel.length
    };
    return res.status(200).json({ success: true, msg: "All hotels", data: hotelData });
  } catch (error) {
    return next(error);
  }
};
// date: date,
// Category:Category,
// location:location,
// priceRange:priceRange,
// personqty:personqty,
// roomqty:roomqty,
// roomtype:roomtype

exports.searchHotel = AsyncerrorHandler(async (req, res, next) => {
  try {
    const { Alllocations, ameneties, sort, startingPrice, date, Category, location, priceRange, personqty, roomqty, roomtype } = req.query;
    const filterCriteria = {};
    
    if (Alllocations !== undefined && Alllocations.length > 0) {
      const locationIds = Alllocations.map(id =>new mongoose.Types.ObjectId(id));
      filterCriteria['LocationId'] = { $in: locationIds };
    }
    
    if (ameneties !== undefined && ameneties.length > 0) {
      console.log("ameneties",ameneties);
      filterCriteria['Ameneties.amenityId'] = { $in: ameneties };
    }
    
    if (priceRange !== undefined) {
      const maxPrice = Number(priceRange);
      if (isNaN(maxPrice)) {
        return next(new ErrorHandler(400, 'Invalid price range'));
      }
      const findRooms = await RoomModel.find({ Price: { $lte: maxPrice } });
      if (!findRooms.length) {
        return res.status(200).send({ msg: `Rooms do not exist for ${maxPrice} price range`, success: false, data: [] });
      }
      filterCriteria['hotelRooms.roomsId'] = { $in: findRooms.map(room => room._id) };
    }
    
    if (Category !== undefined) {
      const findCategories = await CategoryModel.findOne({ text: Category });
      if (!findCategories) {
        return res.status(200).send({ msg: `Hotels for category '${Category}' do not exist`, success: false, data: [] });
      }
      const maxPrice = Number(findCategories?.priceCriteria);
      if (isNaN(maxPrice)) {
        return next(new ErrorHandler(400, 'Invalid price range'));
      }
      const findRooms = await RoomModel.find({ Price: { $gte: maxPrice } });
      if (!findRooms.length) {
        return res.status(200).send({ msg: `Rooms do not exist for ${maxPrice} price range`, success: false, data: [] });
      }
      filterCriteria['hotelRooms.roomsId'] = { $in: findRooms.map(room => room._id) };
    }
    
    if (location !== undefined) {
      if(location=="allhotel"){

      }else{
        const findLocation = await LocationsModel.findOne({ location });
        if (!findLocation) {
          return res.status(200).send({ msg: `Hotels for location '${location}' do not exist`, success: false, data: [] });
        }
        filterCriteria['LocationId'] = findLocation?._id;
      }
  
    }
    
    if (startingPrice !== undefined) {
      const minPrice = Number(startingPrice);
      if (isNaN(minPrice)) {
        return next(new ErrorHandler(400, 'Invalid price range'));
      }
      const findRooms = await RoomModel.find({ Price: { $gte: minPrice } });
      if (!findRooms.length) {
        return next(new ErrorHandler(404, `Rooms do not exist for ${minPrice} price range`));
      }
      filterCriteria['hotelRooms.roomsId'] = { $in: findRooms.map(room => room._id) };
    }
    
    if (roomtype !== undefined) {
      const findRooms = await RoomModel.find({ roomsType: roomtype });
      if (!findRooms.length) {
        return res.status(200).send({ msg: `Rooms of type '${roomtype}' do not exist.`, success: false, data: [] });
      }
      filterCriteria['hotelRooms.roomsId'] = { $in: findRooms.map(room => room._id) };
    }
    console.log("filteredcriteria",filterCriteria);
    let findHotels = HotelModel.find(filterCriteria)
      .populate({
        path: 'hotelRooms.roomsId',
        match: filterCriteria['hotelRooms.roomsId'] ? { _id: { $in: filterCriteria['hotelRooms.roomsId']['$in'] } } : {}
      })
      .populate('Reviews.ReviewId')
      .populate('LocationId')
      .populate('Ameneties.amenityId')
      .populate('offers.offerId')
      .populate('Categories.CategoryId');
    
    if (sort !== undefined) {
      let sortOption = {};
      switch (sort) {
        case 'priceAsc':
          sortOption = { 'hotelRooms.roomsId.Price': 1 };
          break;
        case 'priceDesc':
          sortOption = { 'hotelRooms.roomsId.Price': -1 };
          break;
        case 'ratingAsc':
          sortOption = { 'Ratings': 1 };
          break;
        case 'ratingDesc':
          sortOption = { 'Ratings': -1 };
          break;
        default:
          return res.status(400).json({ success: false, msg: "Invalid sorting parameter" });
      }
      console.log("sorting",sort);
      console.log("sortoptions",sortOption);
      findHotels = findHotels.sort(sortOption);
    }
    
    const allHotel = await findHotels;
    
    allHotel.forEach(hotel => {
      hotel.hotelRooms = hotel.hotelRooms.filter(room => room.roomsId !== null);
    });
    
    let highestPrice = 0;
    let lowestPrice = Infinity;
    allHotel.forEach(hotel => {
      hotel.hotelRooms.forEach(item => {
        if (item.roomsId && item.roomsId.Price) {
          if (item.roomsId.Price > highestPrice) {
            highestPrice = item.roomsId.Price;
          }
          if (item.roomsId.Price < lowestPrice) {
            lowestPrice = item.roomsId.Price;
          }
        }
      });
    });
    
    const hotelData = {
      data: allHotel,
      lowestPrice,
      highestPrice,
      hotelLength: allHotel.length
    };
    
    if (!allHotel.length) {
      return res.status(200).send({ msg: "Hotels do not exist for this criteria", success: false, data: hotelData });
    }
    
    return res.status(200).send({ success: true, data: hotelData });
    
  } catch (error) {
    next(error);
  }
});


async function getLocationIds(locations) {
  console.log("locationsall",locations)
  const locationIds = await LocationsModel.find({ location: { $in: locations } }).distinct('_id');
  return locationIds;
}

async function getAmenityIds(amenities) {
  const amenityIds = await AmenetiesModel.find({ text: { $in: amenities } }).distinct('_id');
  return amenityIds;
}

exports.addReview = AsyncerrorHandler(async (req, res, next) => {
  const { UserId, HotelId, text, ratings } = req.body;
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
  const createReview = new ReviewModel({
    UserId, HotelId, text, ratings, ReviewImages: fileUrls
  })
  createReview.save();
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
      $push: { 'Reviews': { ReviewId: createReview._id } },
      $inc: { NumberOfReviews: 1 },
      $set: { Ratings: AverageRating },
    },
    { new: true }
  );
  return res.status(201).send({ success: true, msg: "Review has been added", data: findHotel })
})

exports.getSingleHotel = AsyncerrorHandler(async (req, res, next) => {
  const Hotelname = req.params.HotelName;
  const roomtype = req.query.type;

  try {
    const singleHotel = await HotelModel.findOne({ Hotelname })
      .populate({
        path: "hotelRooms.roomsId",
        match: { isAvaliable: true }
      })
      .populate('Categories.CategoryId')
      .populate('Reviews.ReviewId')
      .populate('LocationId')
      .populate('offers.offerId')
      .populate('Ameneties.amenityId')
      .populate({
        path: 'Reviews.ReviewId',
        populate: {
          path: 'UserId', // Populate UserId within each review
        },
      })
      .exec();

    if (!singleHotel) {
      return next(new ErrorHandler(404, "Hotel not found"));
    }
    if (roomtype) {

      singleHotel.hotelRooms = singleHotel.hotelRooms.filter((room) => {
        return room.roomsId.roomsType === roomtype;
      });
      if (singleHotel.hotelRooms.length === 0) {
        singleHotel.hotelRooms = [];
      }
    } else {
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


exports.getSingleHotelReviews = AsyncerrorHandler(async (req, res, next) => {

  const singleHotel = await HotelModel.findOne({
    _id: req.params.id,
  })
    .populate('hotelRooms.roomsId')
    .populate('Categories.CategoryId')
    .populate('Reviews.ReviewId')
    .populate('LocationId')
    .populate('offers.offerId')
    .populate('Ameneties.amenityId')
    .populate({
      path: 'Reviews.ReviewId',
      populate: {
        path: 'UserId', // Populate UserId within each review
      },
    })
    .exec();

  if (!singleHotel) {
    return next(new ErrorHandler(404, "Hotel not found"));
  }

  // Filter rooms by roomtype if specified

  return res.status(200).json({
    success: true,
    msg: "Single Hotel reviews dispersed",
    data: singleHotel,
  });

});
exports.GetAllReview = AsyncerrorHandler(async (req, res, next) => {
  const singleHotel = await ReviewModel.find()
    .populate('HotelId')
    .populate('UserId')
  if (!singleHotel.length) {
    return next(new ErrorHandler(404, "Hotel not found"));
  }
  return res.status(200).json({
    success: true,
    msg: "All reviews dispersed",
    data: singleHotel,
  });

});

exports.DeleteSingleHotel = AsyncerrorHandler(async (req, res, next) => {
  const Hotelname = req.params.id;
  const { role } = req.body;
  if (role != 'admin') {
    return next(new ErrorHandler(401, "You are not authorised"))
  }
  const AllReviews = await HotelModel.findOne({ Hotelname });
  if (!AllReviews.length) {
    return next(new ErrorHandler(404, "Reviews does not exist for this hotel"))
  }
  await ReviewModel.deleteMany({ HotelId: AllReviews._id });
  await HotelModel.findByIdAndDelete({ _id: HotelId });
  return res.status(200).send({ success: true, msg: "Hotel is deleted" });
})

exports.GetHotelsByLocations = AsyncerrorHandler(async (req, res, next) => {
  const Locations = req.params.id;
  const findlocation = await LocationsModel.findOne({ location: Locations });
  if (!findlocation) {
    return next(new ErrorHandler(404, "Locations does not exist"));
  }
  const getLocationHotels = await HotelModel.find({ LocationId: findlocation._id }).populate({
    path: "hotelRooms.roomsId",
    match: { isAvaliable: true }
  })
    .populate('Categories.CategoryId')
    .populate('Reviews.ReviewId')
    .populate('LocationId')
    .populate('offers.offerId')
    .populate('Ameneties.amenityId')
    .populate({
      path: 'Reviews.ReviewId',
      populate: {
        path: 'UserId', // Populate UserId within each review
      },
    });
  if (!getLocationHotels.length) {
    return next(new ErrorHandler(404, "for this Location hotels does not exist"));
  }
  return res.status(200).send({ success: true, msg: `available hotels for ${Locations}` })
})

exports.GetHotelreviewpersentage = AsyncerrorHandler(async (req, res, next) => {
  const Hotelname = req.params.HotelName;
  const roomtype = req.query.type;
  const singleHotel = await HotelModel.findOne({ Hotelname })
    .populate('hotelRooms.roomsId')
    .populate('Categories.CategoryId')
    .populate('Reviews.ReviewId')
    .populate('LocationId')
    .populate('offers.offerId')
    .populate('Ameneties.amenityId')
    .populate({
      path: 'Reviews.ReviewId',
      populate: {
        path: 'UserId', // Populate UserId within each review
      },
    })
    .exec();

  if (!singleHotel) {
    return next(new ErrorHandler(404, "Hotel not found"));
  }

  if (roomtype) {


    singleHotel.hotelRooms = singleHotel.hotelRooms.filter((room) => {
      return room.roomsId.roomsType === roomtype;
    });


    if (singleHotel.hotelRooms.length === 0) {
      singleHotel.hotelRooms = [];
    }
  } else {
    singleHotel.hotelRooms = [];
  }
  const allreviews = singleHotel.Reviews;

  const data = await calcualtePersentageOfReviews(allreviews)
  return res.status(200).send({ success: true, msg: "All persentage of ratings", data })
})

function calculatePercentage(count, total) {
  if (total === 0) {
    return 0; // Return 0 when total is zero to avoid NaN
  }
  return ((count / total) * 100).toFixed(2);
}
const calcualtePersentageOfReviews = async (reviews) => {
  let countRating1 = 0;
  let countRating2 = 0;
  let countRating3 = 0;
  let countRating4 = 0;
  let countRating5 = 0;
  reviews.forEach(review => {
    const rating = review.ReviewId?.ratings;
    switch (rating) {
      case 1:
        countRating1++;
        break;
      case 2:
        countRating2++;
        break;
      case 3:
        countRating3++;
        break;
      case 4:
        countRating4++;
        break;
      case 5:
        countRating5++;
        break;
      default:
        // Handle unexpected ratings
        break;
    }
  });
  const totalReviews = reviews.length;
  const percentageRating1 = calculatePercentage(countRating1, totalReviews);
  const percentageRating2 = calculatePercentage(countRating2, totalReviews);
  const percentageRating3 = calculatePercentage(countRating3, totalReviews);
  const percentageRating4 = calculatePercentage(countRating4, totalReviews);
  const percentageRating5 = calculatePercentage(countRating5, totalReviews);
  return {
    percentageRating1,
    percentageRating2,
    percentageRating3,
    percentageRating4,
    percentageRating5
  }
}

exports.GetSimilarHotel = AsyncerrorHandler(async (req, res, next) => {
  const roomtype = req.query.type;
  const Hotelname = req.params.HotelName;
  try {
    const rooms = await RoomModel.find({ roomsType: roomtype });
    const hotelsWithMatchingRooms = await HotelModel.find({
      'hotelRooms.roomsId': {
        $in: rooms.map(room => room._id),
        $ne: null
      }
    })
      .populate({
        path: 'hotelRooms.roomsId',
        match: {
          roomsType: roomtype
        }
      })
      .populate('Categories.CategoryId')
      .populate('Reviews.ReviewId')
      .populate('LocationId')
      .populate('offers.offerId')
      .populate('Ameneties.amenityId')
      .populate({
        path: 'Reviews.ReviewId',
        populate: {
          path: 'UserId'
        }
      })
      .exec();
    const filteredHotels = hotelsWithMatchingRooms.map(hotel => {
      const filteredRooms = hotel.hotelRooms.filter(room => room.roomsId && room.roomsId.roomsType === roomtype);
      return { ...hotel.toObject(), hotelRooms: filteredRooms };
    }).filter(filteredHotel => filteredHotel.hotelRooms.length > 0 && filteredHotel.Hotelname !== Hotelname);
    if (filteredHotels.length === 0) {
      return next(new ErrorHandler(404, `No hotels found with rooms of type ${roomtype}`));
    }
    return res.status(200).json({ success: true, msg: `Hotels with rooms of type ${roomtype}`, data: filteredHotels });
  } catch (error) {
    return next(new ErrorHandler(500, "Internal Server Error"));
  }
});

exports.GetAllRooms = AsyncerrorHandler(async (req, res, next) => {
  const getAllHotel = await RoomModel.find();
  if (!getAllHotel.length) {
    return next(new ErrorHandler(404, "No rooms found"));
  }
  return res.status(200).send({ success: true, msg: "All Rooms are dispersed", data: getAllHotel })
})