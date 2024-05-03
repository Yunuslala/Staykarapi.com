const  mongoose=require('mongoose');
const CategorySchema=mongoose.Schema({
    text:{
        type:String,
        required:true,
    },
    priceCriteria:{
        type:Number

    },
    description:{
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