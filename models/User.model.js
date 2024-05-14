const  mongoose=require('mongoose');
const validator = require('validator');
const UserSchema=mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
      },
      email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
      },
      password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minlength: [6, "Password should be greater than 8 characters"],
      
      },
      phoneNumber: {
        type: String,
        unique:true,
        validate: {
          validator: function(v) {
            // Regular expression for a valid phone number
            return /\d{10}/.test(v);
          },
          message: props => `${props.value} is not a valid phone number!`
        }
      },
      avatar: {
            imageUrl: {
              type: String,
            },
            Key: {
              type: String,
            },
      },
      role: {
        type: String,
        default: "user",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      isDeleted:{
        type:Boolean,
        default:false
      },
      profileId:{
        type:mongoose.Types.ObjectId,
        ref:"Profile"
      }
})

const UserModel=mongoose.model('User',UserSchema);
module.exports={
  UserModel
}