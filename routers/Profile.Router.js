
const express=require("express");
const ProfileRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");

const { upload } = require("../utils/multer");

const { AddBlogFavourites, AddHotelFavourites, ProfileDetails } = require("../controllers/UserProfile.Controller");

ProfileRouter.route("/User/ProfileDetails").post(ProfileDetails);
ProfileRouter.route("/User/AddToFavouriteBlog/:id").post(AddBlogFavourites);
ProfileRouter.route("/User/AddToFavouriteHotels/:id").post(AddHotelFavourites);




module.exports={
    ProfileRouter
}