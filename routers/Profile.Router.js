
const express=require("express");
const ProfileRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");

const { upload } = require("../utils/multer");

const { AddBlogFavourites, AddHotelFavourites, ProfileDetails } = require("../controllers/UserProfile.Controller");

ProfileRouter.route("/User/ProfileDetails").get(Authentication,ProfileDetails);
ProfileRouter.route("/User/AddToFavouriteBlog/:id").patch(Authentication,AddBlogFavourites);
ProfileRouter.route("/User/AddToFavouriteHotels/:id").patch(Authentication,AddHotelFavourites);




module.exports={
    ProfileRouter
}