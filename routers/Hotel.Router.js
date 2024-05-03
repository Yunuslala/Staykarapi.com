
const express=require("express");
const HotelsRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");

const { upload } = require("../utils/multer");

const { AddRooms, RegisteredHotel, AddExtraRooms, GetAllHotel, addReview, getSingleHotel, DeleteSingleHotel, GetHotelsByLocations } = require("../controllers/Hotel.Controller");

HotelsRouter.route("/Admin/AddRooms").post(upload.array('images'),Authentication,AddRooms);
HotelsRouter.route("/Admin/RegisteredHotel").post(upload.array('images'),Authentication,RegisteredHotel);
HotelsRouter.route("/Admin/AddExtraRooms").post(upload.array('images'),Authentication,AddExtraRooms);
HotelsRouter.route("/User/GetAllHotel").get(GetAllHotel);
HotelsRouter.route("/User/AddReview").post(upload.array('images'),Authentication,addReview);
HotelsRouter.route("/User/GetSingleHotel/:id").get(getSingleHotel);
HotelsRouter.route("/Admin/DeleteSingleHotel/:id").get(Authentication,DeleteSingleHotel);
HotelsRouter.route("/User/GetHotelsByLocations/:id").get(GetHotelsByLocations);




module.exports={
    HotelsRouter
}