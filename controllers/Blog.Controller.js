const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { BlogsModel } = require("../models/Blogs.model");
const { ErrorHandler } = require("../utils/Error.Handler");



exports.AddBlogs=AsyncerrorHandler(async(req,res,next)=>{
   const {text,role,UserId,title,description}=req.body;
   let fileUrls={}
   if(req.file){
       try {
           const { imageUrl, key } = await uploadMedia(req.file.path, req.file.mimetype);
           fileUrls={ imageUrl, key}
       } catch (error) {
           console.log('error uploading media',error);
           return next(new ErrorHandler(400,"Error in uploading amenities icons"));
       }
   }
   const createBlogs=new BlogsModel({text,UserId,title,description});
   await createBlogs.save();
   return res.status(200).send({success:true,msg:"Blogss added",data:createBlogs})
})

exports.UpdateBlogs=AsyncerrorHandler(async(req,res,next)=>{
    const {text,role,UserId,title,description,BlogsId}=req.body;
   const findBlogs=await BlogsModel.findOne({_id:BlogsId});
   if(!findBlogs){
    return next(new ErrorHandler(404,"Invalid BlogsId"))
   }else  if(role!="admin" || findOffer.UserId!==UserId ){
    return next(new ErrorHandler(401,"you are not authorized for this route"));
 }
   let fileUrls={}
   if(req.file){
       try {
           const { imageUrl, key } = await uploadMedia(req.file.path, req.file.mimetype);
           fileUrls={ imageUrl, key}
       } catch (error) {
           console.log('error uploading media',error);
           return next(new ErrorHandler(400,"Error in uploading amenities icons"));
       }
   }
    const updateBlogs=await BlogsModel.findByIdAndUpdate({_id:BlogsId},{
        BlogsImages:fileUrls? fileUrls:findBlogs.BlogsImages,description:description?description:findBlogs.description,title:title?title:findBlogs.title
    },{new:true})
    return res.status(201).send({success:true,msg:"Blogs is updated",data:updateBlogs})
 })


 exports.GetAllBlogs=AsyncerrorHandler(async(req,res,next)=>{
 const findBlogs=await BlogsModel.find().populate("UserId");
 if(!findBlogs.length){
  return next(new ErrorHandler(404,"Blogs is empty does not exist"))
 }
  return res.status(201).send({success:true,msg:"All Blogss",data:findBlogs})
})
exports.GetSingleBlog=AsyncerrorHandler(async(req,res,next)=>{
    const findBlogs=await BlogsModel.find({_id:req.params.idd}).populate("UserId");
    if(!findBlogs){
     return next(new ErrorHandler(404,"Blogs is empty does not exist"))
    }
     return res.status(201).send({success:true,msg:"All Blogss",data:findBlogs})
   })

exports.DeleteBlogs=AsyncerrorHandler(async(req,res,next)=>{
  const {role,UserId}=req.body;
  const BlogsId=req.params.id
  const findBlogs=await BlogsModel.findOne({_id:BlogsId});
 if(!findBlogs){
  return next(new ErrorHandler(404,"Invalid BlogsId"))
 }
 if(role!="admin" || findBlogs.UserId!==UserId ){
    return next(new ErrorHandler(401,"you are not authorized for this route"));
 }
 
  const updateBlogs=await BlogsModel.findByIdAndDelete({_id:BlogsId},{new:true})
  return res.status(201).send({success:true,msg:"Blogs is deleted",data:updateBlogs})
})