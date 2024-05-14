const AsyncerrorHandler = require("../middlewares/AsyncerrorHandler");
const { CategoryModel } = require("../models/Categories.Model");
const { ErrorHandler } = require("../utils/Error.Handler");



exports.AddCategory=AsyncerrorHandler(async(req,res,next)=>{
   const {text,PriceCriteria,description,role}=req.body;
   if(role!="admin"){
    return next(new ErrorHandler(401,"you are not authorized for admin routes"));
   }
   const createCategory=new CategoryModel({text,PriceCriteria,description});
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

    const updateCategory=await CategoryModel.findByIdAndUpdate({_id:CategoryId},{
        text:text? text : findCategory.text,PriceCriteria:PriceCriteria? PriceCriteria:findCategory.PriceCriteria,description:description? description:findCategory.description
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
  const {role,CategoryId}=req.body;
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