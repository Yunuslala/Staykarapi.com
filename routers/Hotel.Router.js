
const express=require("express");
const HotelsRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");

const { upload } = require("../utils/multer");

const { AddRooms, RegisteredHotel, AddExtraRooms, GetAllHotel, addReview, getSingleHotel, DeleteSingleHotel, GetHotelsByLocations, searchHotel, getSingleHotelReviews, GetAllReview, GetHotelreviewpersentage, GetSimilarHotel, GetAllRooms } = require("../controllers/Hotel.Controller");

HotelsRouter.route("/Admin/AddRooms").post(upload.array('images'),Authentication,AddRooms);
HotelsRouter.route("/Admin/RegisteredHotel").post(upload.array('images'),Authentication,RegisteredHotel);
HotelsRouter.route("/Admin/AddExtraRooms").post(upload.array('images'),Authentication,AddExtraRooms);
HotelsRouter.route("/User/GetAllHotel").get(GetAllHotel);
HotelsRouter.route("/User/SearchHotel").get(searchHotel);
HotelsRouter.route("/User/AddReview").post(upload.array('images'),addReview);
HotelsRouter.route("/User/GetSingleHotel/:HotelName").get(getSingleHotel);
HotelsRouter.route("/User/GetSingleHotelReviews/:id").get(getSingleHotelReviews);
HotelsRouter.route("/Admin/DeleteSingleHotel/:id").delete(Authentication,DeleteSingleHotel);
HotelsRouter.route("/Admin/DeleteSingleHotelRoom/:id").delete(Authentication,DeleteSingleHotel);
HotelsRouter.route("/User/GetHotelsByLocations/:id").get(GetHotelsByLocations);
HotelsRouter.route("/User/GetAllReview").get(GetAllReview);
HotelsRouter.route("/User/GetAllRooms").get(GetAllRooms);
HotelsRouter.route("/User/GetSingleHotelReviewPersent/:HotelName").get(GetHotelreviewpersentage);
HotelsRouter.route("/User/GetSimilarHotel/:HotelName").get(GetSimilarHotel);





module.exports={
    HotelsRouter
}