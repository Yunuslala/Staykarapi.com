const mongoose = require("mongoose");
const validator = require("validator");
const AddingPropertySchema = mongoose.Schema({
    propertyName: {
    type: String,
    required: true,
  },
  Address: {
    type: String,
    required: true,
  },
  PriceRange: {
    type: String,
    required: true,
  },
  ContactDetail: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  ContactName: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
    validate: [validator.isEmail, "Please Enter a valid Email"],
  },
  phoneNumber: {
    type: String,
    required: true,
    unique:true,
    validate: {
      validator: function(v) {
        // Regular expression for a valid phone number
        return /\d{10}/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// propertyName,
// Address,
// PriceRange,
// ContactDetail,
// website,
// email,
// PhoneNumber,
// ContactName
const AddingPropertyModel = mongoose.model("AddingProperty", AddingPropertySchema);
module.exports = {
  AddingPropertyModel,
};
