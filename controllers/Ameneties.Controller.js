const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { AmenetiesModel } = require("../models/Ameneties.Model");
const { ErrorHandler } = require("../utils/Error.Handler");


exports.AddAmeneties=AsyncerrorHandler(async(req,res,next)=>{
   const {text,role}=req.body;
   if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const createAmeneties=new AmenetiesModel({text});
   await createAmeneties.save();
   return res.status(200).send({success:true,msg:"Amenetiess added",data:createAmeneties})
})

exports.UpdateAmeneties=AsyncerrorHandler(async(req,res,next)=>{
    const {role,AmenetiesId,text}=req.body;
   if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const findAmeneties=await AmenetiesModel.findOne({_id:AmenetiesId});
   if(!findAmeneties){
    return next(new ErrorHandler(404,"Invalid AmenetiesId"))
   }
 
    const updateAmeneties=await AmenetiesModel.findByIdAndUpdate({_id:AmenetiesId},{
      text
    },{new:true})
    return res.status(201).send({success:true,msg:"Ameneties is updated",data:updateAmeneties})
 })

 exports.GetAllAmenetiess=AsyncerrorHandler(async(req,res,next)=>{
 const findAmeneties=await AmenetiesModel.find();
 if(!findAmeneties.length){
  return next(new ErrorHandler(404,"Ameneties is empty does not exist"))
 }
  return res.status(201).send({success:true,msg:"All Amenetiess",data:findAmeneties})
})

exports.DeleteAmeneties=AsyncerrorHandler(async(req,res,next)=>{
  const {role}=req.body;
  const AmenetiesId=req.params.id;
 if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
 }
 const findAmeneties=await AmenetiesModel.findOne({_id:AmenetiesId});
 if(!findAmeneties){
  return next(new ErrorHandler(404,"Invalid AmenetiesId"))
 }
  const updateAmeneties=await AmenetiesModel.findByIdAndDelete({_id:AmenetiesId},{new:true})
  return res.status(201).send({success:true,msg:"Ameneties is deleted",data:updateAmeneties})
})