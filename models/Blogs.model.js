const  mongoose=require('mongoose');
const validator = require('validator');
const BlogsSchema=mongoose.Schema({
   UserId:{
        type:mongoose.Types.ObjectId,
        required:true,
        ref:'User'
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    isFavourite:{
        type:Boolean,
        default:false
    },
    BlogsImages:{
        imageUrl: {
            type: String,
          },
          Key: {
            type: String,
          },

    },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const BlogsModel=mongoose.model('Blogs',BlogsSchema);
module.exports={
  BlogsModel
}