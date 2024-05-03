const multer=require("multer");
const path=require("path");
const fs=require("fs");



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
      console.log("req",file)
      cb(null, file.originalname) // Use original file name for saving
    }
  });
  
  // Create multer instance
const upload = multer({ storage: storage });


const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { day: "numeric", month: "short" };
    return date.toLocaleDateString("en-US", options);
  };




  

const formatTime = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: "numeric", minute: "numeric" };
    return date.toLocaleTimeString("en-US", options);
  };
  

module.exports={
    upload,
    formatDate,
    formatTime
}



// router.post("/upload_invoice",InvoiceUpload.single("upload_invoice"), (req, res) => {
//   const pdf = req.file.destination+"/"+req.file.filename;
//   return apiResponse.mainResponse(res,"success","File uploaded successfully",pdf);
// }, (error, req, res, next) => {
//   return apiResponse.ErrorResponse(res,error.message);
// });
// const multer = require("multer");
// const fs = require("fs");


const PdfFilter = (req, file, cb) => {

  if ( file.mimetype == "application/pdf") {
      cb(null, true);
  } else {
      cb(null, false);
      return cb(new Error('Only pdf format allowed!'));
  }
};

// let storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //     let dest = 'uploads/Invoice'
  //     if (!fs.existsSync(dest)) {
  //         // Create the folder
  //         fs.mkdirSync(des
// Ritesh Kumar Yadav
// 18:01
// exports.upload = async function (source, destinatoin, clear = false) {
// fs.readFile(source, (err, data) => {
//   if (err) console.log(err);
//   const params = {
//     Bucket: process.env.S3_BUCKET, // pass your bucket name
//     Key: destinatoin, // file will be saved as testBucket/contacts.csv
//     Body: data
//   };
//   s3.upload(params, function (s3Err, data) {
//     if (s3Err) throw s3Err
//     if (clear) {
//       fs.unlink(source, function (err) {
//         if (err) return console.log(err);
//         console.log('file deleted