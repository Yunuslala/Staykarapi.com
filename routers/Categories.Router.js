
const express=require("express");
const CategoryRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { AddCategory, UpdateCategories, GetAllCategorys, DeleteCategorys } = require("../controllers/Categories.Controller");

CategoryRouter.route("/Admin/AddCategory").post(Authentication,AddCategory);
CategoryRouter.route("/Admin/UpdateCategory").patch(Authentication,UpdateCategories);
CategoryRouter.route("/User/GetALlCategories").get(GetAllCategorys);
CategoryRouter.route("/Admin/DeleteCategoris").patch(Authentication,DeleteCategorys);



module.exports={
    CategoryRouter
}