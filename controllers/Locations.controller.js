const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { LocationsModel } = require("../models/Locations.model");
const { ErrorHandler } = require("../utils/Error.Handler");
const { uploadMedia } = require("../utils/s3Config");


exports.AddLocation=AsyncerrorHandler(async(req,res,next)=>{
   const {location,startingPrice,role}=req.body;
   if(role!="admin"){
  return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   let fileUrls={}
   if(req.file){
       try {
           const { imageUrl, key } = await uploadMedia(req.file.path, req.file.mimetype);
           fileUrls={ imageUrl, key}
       } catch (error) {
           console.log('error uploading media',error);
           return next(new ErrorHandler(400,"Error in uploading Locations images"));
       }
   }
   const createLocation=new LocationsModel({location,startingPrice,LocationsImages:fileUrls});
   await createLocation.save();
   return res.status(200).send({success:true,msg:"Location added",data:createLocation})
})
exports.UpdateLocations=AsyncerrorHandler(async(req,res,next)=>{
    const {location,startingPrice,role,locationId}=req.body;
   if(role!="admin"){
  return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const findLocation=await LocationsModel.findOne({_id:locationId});
   if(!findLocation){
    return next(new ErrorHandler(404,"Invalid LocationId"))
   }
   let fileUrls={}
   if(req.file){
       try {
           const { imageUrl, key } = await uploadMedia(req.file.path, req.file.mimetype);
           fileUrls={ imageUrl, key}
       } catch (error) {
           console.log('error uploading media',error);
           return next(400,"Error in uploading amenities icons");
       }
   }
    const updateLocation=await LocationsModel.findByIdAndUpdate({_id:locationId},{
        startingPrice,location
    },{new:true})
    return res.status(201).send({success:true,msg:"Location is updated",data:updateLocation})
 })


 exports.GetAllLocations=AsyncerrorHandler(async(req,res,next)=>{
 const findLocation=await LocationsModel.find();
 if(!findLocation.length){
  return next(new ErrorHandler(404,"Invalid LocationId"))
 }
  return res.status(201).send({success:true,msg:"All Locations",data:findLocation})
})

exports.DeleteLocations=AsyncerrorHandler(async(req,res,next)=>{
  const {role}=req.body;
  const locationId=req.params.id
 if(role!="admin"){
  return next(new ErrorHandler(401,"you are not authorized for admin routes"));
 }
 const findLocation=await LocationsModel.findOne({_id:locationId});
 if(!findLocation){
  return next(new ErrorHandler(404,"Invalid LocationId"))
 }
  const updateLocation=await LocationsModel.findByIdAndDelete({_id:locationId},{new:true})
  return res.status(201).send({success:true,msg:"Location is deleted",data:updateLocation})
})