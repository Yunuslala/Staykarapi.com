const  mongoose=require('mongoose');
const validator = require('validator');
const LocationsSchema=mongoose.Schema({
    location:{
        type:String,
        required:true,
        unique:true
    },
    LocationsImages:{
      imageUrl: {
        type: String,
      },
      Key: {
        type: String,
      },

    },
    startingPrice:{
        type:Number
    },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

const LocationsModel=mongoose.model('Locations',LocationsSchema);
module.exports={
  LocationsModel
}