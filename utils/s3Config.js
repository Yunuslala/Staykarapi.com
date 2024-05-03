
const AWS = require("aws-sdk");
const config = require("../config/env");

const fs=require('fs');
const { PaymentModel } = require("../models/Payment.Model");

const awsConfig = {
    accessKeyId: config.ACCESS_KEY_ID,
    secretAccessKey: config.SECRET_ACCESS_KEY,
    region: config.AWS_REGION,
  };
  
  const PdfBucket = config.BUCKET2;
  const S3 = new AWS.S3(awsConfig);
  
  const uploadInvoiceToS3 = async (pdfBuffer, filename) => {
    const uploadParams = {
      Bucket: PdfBucket,
      Key: filename,
      Body: pdfBuffer,
      ContentType: "application/pdf", // Set the content type
    };
  
    const uploadResult = await S3.upload(uploadParams).promise();
    console.log(uploadResult);
    return uploadResult.Location; // Return the S3 URL of the uploaded PDF
  };


  const updateBookingWithPDFURL = async (bookingId, pdfUrl) => {
    try {
      const updatedBooking = await PaymentModel.findOneAndUpdate(
        { BookingId: bookingId },
        { $set: { invoice_pdf_url: pdfUrl } },
        { new: true }
      );
      console.log(updatedBooking, pdfUrl);
      return updatedBooking;
    } catch (error) {
      throw error;
    }
  };




//   const uploadMedia = (source) => {

//     return new Promise(async (resolve, reject) => {
//         try {
//           fs.readFile(source,(err,data)=>{
//             const avifKey = `${Date.now().toString()}.webp`;

//             // Upload the AVIF image to S3
//             const params = {
//                 Bucket: config.BUCKET1,
//                 Key: avifKey,
//                 Body: finalavifImageBuffer,
//                 ContentType:fileData.mimetype
//             };
//             S3.upload(params, async (err, data) => {
//               if (err) {
//                   console.log(err);
//                   return reject(err);
//               }

//               // Read the uploaded image data from S3
//               const uploadedImageData = await S3.getObject({ Bucket: bucketName1, Key: avifKey }).promise();

//               // Convert the image data to base64 format
//               const base64ImageData = Buffer.from(uploadedImageData.Body).toString('base64');

//               const base64ImageUrl = `data:image/webp;base64,${base64ImageData}`;

//               return resolve(base64ImageUrl); // Return the base64 image URL
//           });
//           })
//             // Compress and convert to AVIF
//             // Generate a unique key for the AVIF image
         

        
//         } catch (error) {
//             console.error('Error compressing and uploading image to AVIF:', error);
//             return reject(error);
//         }
//     });
// };



// const uploadMedia = (source, mimetype)=>{
//   const avifKey = `${Date.now().toString()}.webp`;
//   fs.readFile(source, (err, data) => {
//     if (err) console.log(err);
//     const params = {
//       Bucket:config.BUCKET1, // pass your bucket name
//       Key: avifKey, // file will be saved as testBucket/contacts.csv
//       Body: data,
//       ContentType:mimetype
//     };
//     S3.upload(params, async (s3Err, data)=>{
//       if (s3Err) throw s3Err
//       fs.unlink(source,async(err)=>{
//         if(err) console.log(err);
//         console.log("file deleted");
//        const data = await S3.getObject({ Bucket: config.BUCKET1, Key: avifKey }).promise();
//       //  const base64ImageData = Buffer.from(data.Body).toString('base64');
//       //  const base64ImageUrl = `data:image/webp;base64,${base64ImageData}`;
//        console.log("data",);
//       })
//     })
//   })
// }



const uploadMedia = (source, mimetype) => {
  return new Promise((resolve, reject) => {
    const avifKey = `${Date.now().toString()}.webp`;
    fs.readFile(source, (err, data) => {
    const params = {
      Bucket: config.BUCKET1, // Replace with your bucket name
      Key: avifKey,
      Body: data,
      ContentType: mimetype
    };
    S3.upload(params, async (s3Err, s3Data) => {
      if (s3Err) {
        console.error("Error uploading to S3:", s3Err);
        reject(s3Err);
        return;
      }
      // Delete the local file if needed
      fs.unlink(source, async (err) => {
        if (err) {
          console.error("Error deleting local file:", err);
          return;
        }
      });
      resolve({ imageUrl: s3Data.Location, key: s3Data.Key }) // Resolve with the S3 URL
    });
  })
  });
};




  module.exports={
    uploadInvoiceToS3,
    updateBookingWithPDFURL,
    uploadMedia
  }