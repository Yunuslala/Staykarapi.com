const  mongoose=require('mongoose');
const QuerySchema=mongoose.Schema({
    text:{
        type:String,
        required:true,
    },
    queryType:{
        type:String,
        enum:['Complaint','Enquiry','Others']
    },
    isSolved:{
        type:Boolean,
        default:false
    },
  
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    queryImages:[{
        imageUrl: {
            type: String,
          },
          Key: {
            type: String,
          },
    }],
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const QueryModel=mongoose.model('Query',QuerySchema);
module.exports={
  QueryModel
}