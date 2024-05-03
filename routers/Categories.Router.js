
const express=require("express");
const CategoryRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { AddCategory, UpdateCategories, GetAllCategorys, DeleteCategorys } = require("../controllers/Categories.Controller");
const { upload } = require("../utils/multer");

CategoryRouter.route("/Admin/AddCategory").post(upload.single("image"),Authentication,AddCategory);
CategoryRouter.route("/Admin/UpdateCategory").patch(upload.single("image"),Authentication,UpdateCategories);
CategoryRouter.route("/User/GetALlCategories").get(GetAllCategorys);
CategoryRouter.route("/Admin/DeleteCategoris/:id").delete(Authentication,DeleteCategorys);



module.exports={
    CategoryRouter
}