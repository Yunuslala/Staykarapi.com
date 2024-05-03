require('dotenv').config()
const mongoose=require("mongoose");

const connection=mongoose.connect("mongodb+srv://saifsiddiqui7379527559:saif@cluster0.edmqzr6.mongodb.net/staykarstorage?retryWrites=true&w=majority&appName=Cluster0");

module.exports={
    connection,
}

  
