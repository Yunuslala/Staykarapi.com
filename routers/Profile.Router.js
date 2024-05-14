
const express=require("express");
const ProfileRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");

const { upload } = require("../utils/multer");

const { AddBlogFavourites, AddHotelFavourites, ProfileDetails, getAllProfiles, deleteProfile, GetSingleProfile } = require("../controllers/UserProfile.Controller");

ProfileRouter.route("/User/ProfileDetails").post(ProfileDetails);
ProfileRouter.route("/User/AddToFavouriteBlog/:id").post(AddBlogFavourites);
ProfileRouter.route("/User/AddToFavouriteHotels/:id").post(AddHotelFavourites);
ProfileRouter.route("/User/GetAllProfiles").get(getAllProfiles);
ProfileRouter.route("/User/GetingleProfile/:id").delete(deleteProfile);
ProfileRouter.route("/User/GetingleProfile/:id").get(GetSingleProfile);






module.exports={
    ProfileRouter
}