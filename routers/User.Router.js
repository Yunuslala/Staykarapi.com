const  {RegisterUser,loginUser,updatePassword,updateProfile,resetPassword,getAllUser, getSingleUser, updateUserRole, deleteUser,MyProfile, forgotPassword, loginWithGoogle}=require("../controllers/User.Controller");
const express=require("express");
const UserRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const {upload}=require("../utils/multer")
UserRouter.route("/User/register").post(RegisterUser);
UserRouter.route("/User/login").post(loginUser);
UserRouter.route("/User/login-Google").post(loginWithGoogle);
UserRouter.route("/User/update-password").patch(Authentication,updatePassword);
UserRouter.route("/User/update-profile").patch(upload.single('profile'),Authentication,updateProfile);
UserRouter.route("/User/Alluser").get(getAllUser);
UserRouter.route("/User/profile").post(MyProfile);
UserRouter.route("/User/SingleUser/:id").get(Authentication,getSingleUser);
UserRouter.route("/User/update-role/:id").patch(Authentication,updateUserRole);
UserRouter.route("/User/deleteUser/:id").delete(deleteUser);
UserRouter.route("/User/forget/password").patch(forgotPassword);
UserRouter.route("/User/reset/password").patch(resetPassword);


module.exports={
    UserRouter
}