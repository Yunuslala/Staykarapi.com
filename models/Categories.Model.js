const  mongoose=require('mongoose');
const validator = require('validator');
const CategorySchema=mongoose.Schema({
    text:{
        type:String,
        required:true,
    },
    priceCriteria:{
        type:Number

    },
    CategoryImages:{
      imageUrl: {
        type: String,
      },
      Key: {
        type: String,
      },

    },
    description:{
        type:String,
    },
    type:{
      type:String,
  },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const CategoryModel=mongoose.model('Category',CategorySchema);
module.exports={
  CategoryModel
}