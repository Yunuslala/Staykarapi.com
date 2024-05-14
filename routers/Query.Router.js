
const express=require("express");
const QueryRouter=express.Router();
const {Authentication}=require("../middlewares/Authenitcation");
const { upload } = require("../utils/multer");
const { GetAllQuery, AddQuery, GetAllQueryByUser, GetAllQueryByType, GetQueryById, SolveTheQuery } = require("../controllers/Query.Controller");

QueryRouter.route("/User/AddQuery").post(upload.array('images'),AddQuery);
QueryRouter.route("/User/GetAllQuery").get(Authentication,GetAllQuery);
QueryRouter.route("/User/GetAllUserQuery/:id").get(GetAllQueryByUser);
QueryRouter.route("/User/GetAllUserQueryByType").get(GetAllQueryByType);
QueryRouter.route("/User/GetAllQueryById/:id").get(GetQueryById);
QueryRouter.route("/User/SolveQuery/:id").get(SolveTheQuery);




module.exports={
    QueryRouter
}