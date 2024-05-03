const mongoose = require("mongoose");
const validator = require("validator");
const AmenetiesSchema = mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const AmenetiesModel = mongoose.model("Ameneties", AmenetiesSchema);
module.exports = {
  AmenetiesModel,
};
