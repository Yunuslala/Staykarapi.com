
const express=require("express");
const AmenetiesRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { AddAmeneties, UpdateAmeneties, GetAllAmenetiess, DeleteAmeneties } = require("../controllers/Ameneties.Controller");

AmenetiesRouter.route("/Admin/AddAmenety").post(Authentication,AddAmeneties);
AmenetiesRouter.route("/Admin/UpdateAmenety").patch(Authentication,UpdateAmeneties);
AmenetiesRouter.route("/User/GetAllAmeneties").get(GetAllAmenetiess);
AmenetiesRouter.route("/Admin/DeleteAmenety/:id").patch(Authentication,DeleteAmeneties);




module.exports={
    AmenetiesRouter
}