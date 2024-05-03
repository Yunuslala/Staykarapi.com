
const express=require("express");
const BlogRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { AddBlogs, UpdateBlogs, GetAllBlogs, DeleteBlogs } = require("../controllers/Blog.Controller");
const { upload } = require("../utils/multer");

BlogRouter.route("/Admin/AddBlog").post(upload.single('image'),Authentication,AddBlogs);
BlogRouter.route("/Admin/UpdateBlogs").patch(upload.single('image'),Authentication,UpdateBlogs);
BlogRouter.route("/User/GetALlBlogs").get(GetAllBlogs);
BlogRouter.route("/Admin/DeleteBlogs/:id").patch(Authentication,DeleteBlogs);



module.exports={
    BlogRouter
}