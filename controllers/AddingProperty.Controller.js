const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { AddingPropertyModel } = require("../models/AddingProperty.model");

const { ErrorHandler } = require("../utils/Error.Handler");


exports.AddingNewProperty=AsyncerrorHandler(async(req,res,next)=>{
   const { propertyName,
    Address,
    PriceRange,
    ContactDetail,
    website,
    email,
    PhoneNumber,
    ContactName}=req.body;
  
   const addingdata=new AddingPropertyModel({propertyName,
    Address,
    PriceRange,
    ContactDetail,
    website,
    email,
    PhoneNumber,
    ContactName});
   await addingdata.save();
   return res.status(200).send({success:true,msg:"Amenetiess added",data:addingdata})
})

