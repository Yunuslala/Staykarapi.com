const mongoose = require("mongoose");
const validator = require("validator");

const ProfileSchema = mongoose.Schema({
  UserId: {
    type: mongoose.Types.ObjectId,
    ref: "user",
    required: [true, "Please Enter userId"],
  },
  FavouriteBlogs: [
    {
      blogId: {
        type: mongoose.Types.ObjectId,
        ref: "Blogs",
      },
    },
  ],
  FavouriteHotels: [
    {
      HotelId: {
        type: mongoose.Types.ObjectId,
        ref: "Hotel",
      },
    },
  ],
  MyBookings: [
    {
      BookingId: {
        type: mongoose.Types.ObjectId,
        ref: "Booking",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ProfileModel = mongoose.model("Profile", ProfileSchema);
module.exports = {
  ProfileModel,
};
