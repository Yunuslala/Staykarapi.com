const express=require("express");
const LocationRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { upload } = require("../utils/multer");
const { AddLocation, UpdateLocations, GetAllLocations, DeleteLocations } = require("../controllers/Locations.controller");

LocationRouter.route("/Admin/AddLocation").post(upload.single('image'),AddLocation);
LocationRouter.route("/Admin/UpdateLocation").patch(upload.single('image'),Authentication,UpdateLocations);
LocationRouter.route("/User/GetAllLocations").get(GetAllLocations);
LocationRouter.route("/Admin/DeleteLocations/:id").patch(Authentication,DeleteLocations);



module.exports={
    LocationRouter
}