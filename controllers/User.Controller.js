const AsyncErrorHandler=require("../middlewares/AsyncerrorHandler");
const {UserModel}=require("../models/User.model");
const {ErrorHandler}=require("../utils/Error.Handler");
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const SentMail =require("../utils/SentMail");
const { uploadMedia } = require("../utils/s3Config");
const { ProfileModel } = require("../models/Profile.Model");


exports.RegisterUser=AsyncErrorHandler(async(req,res,next)=>{
    const  {name,email,password,phoneNumber,role}=req.body;
    const findExisting=await UserModel.findOne({email});
    if(findExisting){
        return next(new ErrorHandler(400,"User already exist go for login"))
    }
    const hash=await bcrypt.hash(password,10);
    const saveUser=new UserModel({
        name,email,password:hash,phoneNumber,role
    })
    await saveUser.save();
    const createProfile=new ProfileModel({UserId:saveUser._id});
    await createProfile.save();
    
    return res.status(201).send({
        success:true,
        msg:"User has been registered sucessfully",
    })
})



exports.loginUser=AsyncErrorHandler(async(req,res,next)=>{
    const  {email,password}=req.body;
    if(!email || !password){
        console.log("object")
        return next(new ErrorHandler(400,"Email And Password required"));
    }
    let finduser=await UserModel.findOne({email}).select("+password");
    if(!finduser){
        return next(new ErrorHandler(404,"Email is not registered go for signup first"))
    }
    console.log("object",finduser);
    let compare=await bcrypt.compare(password,finduser.password);
    if(compare){
        const token=await jwt.sign({UserId:finduser._id,role:finduser.role},process.env.secret,);
        return res.status(200).send({
            success:true,
            msg:"User has been login sucessfully",
            token,
            data:finduser
        })
    }else{
        return next(new ErrorHandler(400,"password is not correct"))
    }
})


exports.forgotPassword=AsyncErrorHandler(async(req,res,next)=>{
    const finduser=await UserModel.findOne({email:req.body.email});
    if(!finduser){
        return next(new ErrorHandler(404,"Email is not registered go for signup first"))
    }
    const Expirestoken=jwt.sign({email:finduser.email},"resetPass",{expiresIn:'5m'});
    const resetTokenUrl=`https://my-e-commerce-frontend-o1fsmoezk-yunuslala.vercel.app/reset/password/${Expirestoken}`;

    const message=`Your password reset token is It is only valid for 5 minute: <br/><br/><a href="${resetTokenUrl}">${resetTokenUrl}</a><br/><br/>If you have not requested this email, please ignore it.`;
    try {
        await SentMail({
          email: finduser.email,
          subject: `Ecommerce Password Recovery`,
          message,
        });

        res.status(200).json({
          success: true,
          message: `Email sent to ${finduser.email} successfully`,
        });
      } catch (error) {
        return next(new ErrorHander( 500,error.message));
      }
})


exports.resetPassword=AsyncErrorHandler(async(req,res,next)=>{
   const {resetToken,password,confirmPassword,UserId}=req.body;
 const  decoded=jwt.verify(resetToken,"resetPass")
if(!decoded){
    return next(new ErrorHandler(400,"Reset Password Token is invalid or has been expired"))
}
if(!password||!confirmPassword){
    return next(new ErrorHandler(400,"oldpassword newpassword and confirmpassword is required"));
}
const finduser=await UserModel.findOne({email:decoded.email},{new:true}).select("+password");
if(!finduser){
    return next(new ErrorHandler(404,"user does not exist"))
}
if(password!=confirmPassword){
    return next(new ErrorHandler(400,"confirm password did not matched"))
}
const hash=await bcrypt.hash(password,10)
const updatePassowrd=await UserModel.findOneAndUpdate({email:decoded.email},{password:hash},{new:true})
return res.status(200).send({
    success:true,
    message:"your password has been reset",
    data:updatePassowrd
})
})

exports. updatePassword=AsyncErrorHandler(async(req,res,next)=>{
    const {oldpassword,newpassword,confirmPassword,UserId}=req.body;
    if(!oldpassword||!newpassword||!confirmPassword){
        return next(new ErrorHandler(400,"oldpassword newpassword and confirmpassword is required"));
    }
    const finduser=await UserModel.findById({_id:UserId},{new:true}).select("+password");
    if(!finduser){
        return next(new ErrorHandler(404,"user does not exist"))
    }
    if(newpassword!=confirmPassword){
        return next(new ErrorHandler(400,"confirm password did not matched"))
    }
    let compare=await bcrypt.compare(oldpassword,finduser.password);
    if(compare){
        const hash=await bcrypt.hash(newpassword,10)
        const updatePassowrd=await UserModel.findByIdAndUpdate({_id:UserId},{password:hash},{new:true})
        return res.status(200).send({
            success:true,
            msg:"your password has been updated",
            data:updatePassowrd
        })
    }else{
        return next(new ErrorHandler(400,"old password is not correct"))
    }
    
})


exports.updateProfile=AsyncErrorHandler(async(req,res,next)=>{
    const  {name,email,UserId,phoneNumber}=req.body;
    const finduser=await UserModel.findById({_id:UserId});
    if(!finduser){
        return next(new ErrorHandler(404,"user does not exist"))
    }
    let fileUrls={}
    if(req.file){
        try {
            const { imageUrl, key } = await uploadMedia(req.file.path, req.file.mimetype);
            fileUrls={ imageUrl, key}
            console.log("fileurls",fileUrls)
        } catch (error) {
            console.log('error uploading media',error);
            return next(new ErrorHandler(400,"Error in uploading user profile"));
        }
    }
    const updateData={
        name:name || finduser.name,
        email:email || finduser.email,
        avatar:fileUrls || finduser.avatar,
        phoneNumber:phoneNumber || finduser.phoneNumber
    }
    const updateUser=await UserModel.findByIdAndUpdate({_id:UserId},updateData,{new:true});
    return res.status(200).send({
        success:true,
        msg:"user profile has been updated",
        data:updateUser
    }) 
})


exports.getAllUser=AsyncErrorHandler(async(req,res,next)=>{
    let {role}=req.body;
    if(role!="admin"){
        return next(new ErrorHandler(401,"you are not authorize for these routes"))
    }
    const data=await UserModel.find();
    if(!data.length){
        return next(new ErrorHandler(404,"users does not exist"));
    }
    return res.status(200).send({
        sucess:true,
        data,
        msg:"All User dispersed"
    })
})


exports.getSingleUser=AsyncErrorHandler(async(req,res,next)=>{
    let {role}=req.body;
    if(role!="admin"){
        return next(new ErrorHandler(401,"you are not authorize for these routes"))
    }
    const finduser=await UserModel.findOne({_id:req.params.id})
    if(!finduser){
        return next(new ErrorHandler(404,"user does not exist"))
    }
    return res.status(200).send({
        sucess:true,
        data:finduser,
        msg:"single user dispersed"
    })
})


exports.updateUserRole=AsyncErrorHandler(async(req,res,next)=>{
    let {role}=req.body;
    if(role!="admin"){
        return next(new ErrorHandler(401,"you are not authorize for these routes"))
    }
    const finduser=await UserModel.findOne({_id:req.params.id})
    if(!finduser){
        return next(new ErrorHandler(404,"user does not exist"))
    }
    const  updateRole=await UserModel.findByIdAndUpdate({_id:req.params.id},{role:"admin"},{new:true});
    return res.status(200).send({
        sucess:true,
        msg:"user is priortise as admin sucessfully",
        data:finduser,
    })
})


exports.deleteUser=AsyncErrorHandler(async(req,res,next)=>{
    let {role}=req.body;
    if(role!="admin"){
        return next(new ErrorHandler(401,"you are not authorize for these routes"))
    }
    const finduser=await UserModel.findOne({_id:req.params.id})
    if(!finduser){
        return next(new ErrorHandler(404,"user does not exist"))
    }
    const deleteImage=await cloudinary.uploader.destroy(finduser.avatar);
    const  updateRole=await UserModel.findByIdAndDelete({_id:req.params.id});
    return res.status(200).send({
        sucess:true,
        msg:"user is deleted sucessfully",
        data:finduser,
    })
})


exports.MyProfile=AsyncErrorHandler(async(req,res,next)=>{
    const {UserId}=req.body;
    const GetMe=await UserModel.findOne({_id:UserId});
    if(!GetMe){
        return next(new ErrorHandler(404,"user does not exist"))
    }
    return res.status(200).send({
        sucess:true,
        msg:"user is fetched sucessfully",
        data:GetMe,
    })
})