const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { CategoryModel } = require("../models/Categories.Model");
const { ErrorHandler } = require("../utils/Error.Handler");
const { uploadMedia } = require("../utils/s3Config");



exports.AddCategory=AsyncerrorHandler(async(req,res,next)=>{
   const {text,PriceCriteria,type,description,role}=req.body;
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

   const createCategory=new CategoryModel({text,type,CategoryImages:fileUrls,PriceCriteria,description});
   await createCategory.save();
   return res.status(200).send({success:true,msg:"Categorys added",data:createCategory})
})

exports.UpdateCategories=AsyncerrorHandler(async(req,res,next)=>{
    const {role,CategoryId,text,PriceCriteria,description}=req.body;
   if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
  
   const findCategory=await CategoryModel.findOne({_id:CategoryId});
   if(!findCategory){
    return next(new ErrorHandler(404,"Invalid CategoryId"))
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

    const updateCategory=await CategoryModel.findByIdAndUpdate({_id:CategoryId},{
      CategoryImages:fileUrls?.imageUrl?fileUrls:findCategory?.CategoryImages, text:text? text : findCategory.text,PriceCriteria:PriceCriteria? PriceCriteria:findCategory.PriceCriteria,description:description? description:findCategory.description
    },{new:true})
    return res.status(201).send({success:true,msg:"Category is updated",data:updateCategory})
 })


 exports.GetAllCategorys=AsyncerrorHandler(async(req,res,next)=>{
 const findCategory=await CategoryModel.find();
 if(!findCategory.length){
  return next(new ErrorHandler(404,"Category is empty does not exist"))
 }
  return res.status(201).send({success:true,msg:"All Categorys",data:findCategory})
})

exports.DeleteCategorys=AsyncerrorHandler(async(req,res,next)=>{
  const {role}=req.body;
  const CategoryId=req.params.id;
  if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
 }
 const findCategory=await CategoryModel.findOne({_id:CategoryId});
 if(!findCategory){
  return next(new ErrorHandler(404,"Invalid CategoryId"))
 }
  const updateCategory=await CategoryModel.findByIdAndDelete({_id:CategoryId},{new:true})
  return res.status(201).send({success:true,msg:"Category is deleted",data:updateCategory})
})