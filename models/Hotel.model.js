const mongoose = require("mongoose");
const validator = require("validator");

const HotelSchema = mongoose.Schema({
  Hotelname: {
    type: String,
    required: [true, "Please Enter Hotelname"],
    unique: true,
  },
  address: {
    type: String,
    required: [true, "Please Provide Hotel Address"],
    unique: true,
  },
  longitude: {
    type: String,
    required: [true, "Please Enter longitude"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        // Regular expression for a valid phone number
        return /\d{10}/.test(v);
      },
      message: (props) => `${props.value} is not a valid phone number!`,
    },
  },
  latitude: {
    type: String,
    required: [true, "Please Enter latitude"],
  },
  description: {
    type: String,
    required: [true, "Please Enter Hotel description"],
  },
  NumberOfReviews: {
    type: Number,
    default: 0,
  },
  Ratings: {
    type: Number,
    default: 0,
  },
  isFavourites: {
    type: Boolean,
    default: false,
  },
  Ameneties: [
    {
      amenityId: {
        type: mongoose.Types.ObjectId,
        ref: "Ameneties",
        required: [true, "amenties are required"],
      },
    },
  ],
  isFavourite: {
    type: Boolean,
    default: false,
  },
  hotelRooms: [
    {
      roomsId: {
        type: mongoose.Types.ObjectId,
        ref: "Room"
      },
    },
  ],
  Categories: [
    {
      CategoryId: {
        type: mongoose.Types.ObjectId,
        ref: "Category",
        required: [true, "Categories are required"],
      },
    },
  ],
  Reviews: [
    {
      ReviewId: {
        type: mongoose.Types.ObjectId,
        ref: "Review",
      },
    },
  ],
  LocationId: {
    type: mongoose.Types.ObjectId,
    ref: "Locations",
    required: [true, "locations are required"],
  },
  hotelImgaes: [{
    imageUrl: {
      type: String,
      required: [true, "hotel Images Are required"],
    },
    Key: {
      type: String,
    },
  }],
  offers: [
    {
      offerId: {
        type: mongoose.Types.ObjectId,
        ref: "Offer",
      },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const HotelModel = mongoose.model("Hotel", HotelSchema);
module.exports = {
  HotelModel,
};
