const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");

const { QueryModel } = require("../models/Query.Model");
const { ErrorHandler } = require("../utils/Error.Handler");



exports.AddQuery=AsyncerrorHandler(async(req,res,next)=>{
   const {text,queryType,UserId}=req.body;
   let fileUrls = [];
   if (req.files && req.files.length > 0) {
     // Map the array of files to an array of promises returned by uploadMedia
     const uploadPromises = req.files.map(async (item) => {
       try {
         const { key, imageUrl } = await uploadMedia(item.path, item.mimetype);
         return { key, imageUrl };
       } catch (err) {
         console.error("Error uploading media:", err);
         return next(new ErrorHandler(400, "Error in uploading query Images"));
       }
     });
     const uploadedFiles = await Promise.all(uploadPromises);
     fileUrls = uploadedFiles.filter(Boolean);
   }
   const createQuery=new QueryModel({text,queryType,UserId,queryImages:fileUrls});
   await createQuery.save();
   return res.status(200).send({success:true,msg:"Your Issue is raised we will short out with you in a Day",data:createQuery})
})

exports.GetAllQuery=AsyncerrorHandler(async(req,res,next)=>{
    const {role}=req.body;
   if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const findQuery=await QueryModel.find();
   if(!findQuery.length){
    return next(new ErrorHandler(404,"Queries does not exist"))
   }   
    return res.status(201).send({success:true,msg:"All Queries despersed",data:findQuery})
 })

 exports.GetAllQueryByUser=AsyncerrorHandler(async(req,res,next)=>{
    const UserId=req.params.id;
 const findQuery=await QueryModel.find({UserId});
 if(!findQuery.length){
  return next(new ErrorHandler(404,"Query is empty does not exist"))
 }
  return res.status(201).send({success:true,msg:"All User Query dispersed",data:findQuery})
})

exports.GetAllQueryByType=AsyncerrorHandler(async(req,res,next)=>{
  const {role}=req.body;
  const queryType=req.query.type
 if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
 }
 const findQuery=await QueryModel.find({queryType});
 if(!findQuery.length){
  return next(new ErrorHandler(404,"Query doest not exist for this type"))
 }
  return res.status(201).send({success:true,msg:"Queries are dispersed",data:findQuery})
})

exports.GetQueryById=AsyncerrorHandler(async(req,res,next)=>{
    const {role}=req.body;
    const id=req.params.id;
   if(role!="admin"){
      return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const findQuery=await QueryModel.findOne({_id:id});
   if(!findQuery){
    return next(new ErrorHandler(404,"Query doest not exist Invalid Id "))
   }
    return res.status(201).send({success:true,msg:"Query is dispersed",data:findQuery})
  })

  exports.SolveTheQuery=AsyncerrorHandler(async(req,res,next)=>{
    const {role}=req.body;
    const id=req.params.id;
   if(role!="admin"){
      return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const findQuery=await QueryModel.findOne({_id:id});
   if(!findQuery){
    return next(new ErrorHandler(404,"Query doest not exist Invalid Id "))
   }
   const updatequery=await QueryModel.findOneAndUpdate({_id:id},{
    isSolved:true
   },{
    new:true
   })
    return res.status(201).send({success:true,msg:"Query is dispersed",data:updatequery})
  })