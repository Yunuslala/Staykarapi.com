
const express=require("express");
const AddingPropertyRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { AddingNewProperty } = require("../controllers/AddingProperty.Controller");


AddingPropertyRouter.route("/User/AddProperty").post(Authentication,AddingNewProperty);




module.exports={
    AddingPropertyRouter
}