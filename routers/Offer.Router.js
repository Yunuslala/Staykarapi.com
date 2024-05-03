
const express=require("express");
const OffersRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { upload } = require("../utils/multer");
const { AddOffer, UpdateOffers, AssignToHotels, GetOffersOfHotel, AllOffers, DeleteOffers, GetSingleOffer } = require("../controllers/Offers.Controller");

OffersRouter.route("/Admin/AddOffers").post(upload.single('image'),Authentication,AddOffer);
OffersRouter.route("/Admin/UpdateOffers").patch(upload.single('image'),Authentication,UpdateOffers);
OffersRouter.route("/User/GetAllOfers").get(AllOffers);
OffersRouter.route("/Admin/DeleteOffers/:id").patch(Authentication,DeleteOffers);
OffersRouter.route("/Admin/OffersAssign").post(Authentication,AssignToHotels);
OffersRouter.route("/User/HotelsOffer/:id").get(GetOffersOfHotel);
OffersRouter.route("/Get/Offer/:id").get(GetSingleOffer);





module.exports={
    OffersRouter
}