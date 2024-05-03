const BookingModel  =require("../models/Booking.model");
const nodemailer=require("nodemailer")
const config=require("../config/env");
const { uploadInvoiceToS3, updateBookingWithPDFURL } = require("./s3Config");
const pdf = require("html-pdf");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { formatDate, formatTime } = require("./multer");
require('dotenv').config();



// const SentMail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMPT_HOST,
//     port: process.env.SMPT_PORT,
//     service: process.env.SMPT_SERVICE,
//     auth: {
//       user: process.env.SMPT_MAIL,
//       pass: process.env.SMPT_PASSWORD,
//     },
//   });

//   const mailOptions = {
//     from: process.env.SMPT_MAIL,
//     to: options.email,
//     subject: options.subject,
//     html: options.message,
//     isHTML: true,
//   };

//   await transporter.sendMail(mailOptions);
// };

const SendOTPmail = async (userDetail,random, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
  });
    // console.log(transporter)
    const mailOptions = {
      from: "staykr990@gmail.com",
      to: userDetail.email,
      subject: `Sent OTP for verification`,
      html: `<html><head><title>Welcome to StayKr</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);"><div style="text-align: center; margin-bottom: 20px;"><img src="https://staykr.com/static/media/Union.7389e099.png" alt="StayKr Logo" style="width: 150px;"></div><p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Hi <strong>${userDetail.name}</strong>,</p><p>Welcome to StayKr! Otp for verifications. :</p><div style="margin-bottom: 20px;"><p><strong>Email:</strong> ${userDetail.email}</p><p><strong>OTP:</strong> ${random}</p></div><div style="text-align: center; margin-top: 30px;"><a href="http://localhost:3000/admin_login" style="color: #fff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">Click here to log in</a></div><p>We recommend changing your password after logging in for the first time. If you have any questions or need assistance, please don't hesitate to contact our support team.</p></div><div style="margin-top: 30px; text-align: center; color: #777;"><p>Best regards,<br>The StayKr Team</p></div></body></html>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      if (info)
        return res
          .status(202)
          .send({
            success: true,
            message: "Notification sent to your registered email address.",
            otp:random,
            data:userDetail
          });
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ success: false, msg: err.message })
    
  }
};




const sendPaymentSuccessEmail=async(Booking,res)=>{
  try {
    // Read HTML template
    const details=await BookingModel.findOne({_id:Booking._id}).populate('UserId').populate('HotelId').populate('roomsId').populate('appliedOfferId').populate('paymentId');

    const payStatus=details?.paymentId?.paymentMode==='Online Payment'? 'Paid' : 'Not paid'
      console.log("guestdetail",details)
      const bookingDate=formatDate( details?.timestamp);
      const bookingTime=formatTime( details?.timestamp);
      const checkInDate=formatDate( details?.StartingDate);
      const checkOutDate=formatDate(details?.EndDate);
      const bookDateTime=`${bookingDate} ${bookingTime}`
      const checkInDateTime=`${checkInDate} `
      const checkOutDateTime=`${checkOutDate}`

    const htmlTemplate = await fs.promises.readFile("./index.html", "utf8");
    // Replace placeholders with actual data
    const filledTemplate = htmlTemplate
      .replace("{{ guest_name }}", details?.UserId?.name)
      .replace("{{ guest_email }}", details?.UserId?.email)
      .replace("{{ guest_phone }}", details?.UserId?.phone)
      .replace("{{ hotel_nameA }}", details?.HotelId?.HotelName)
      .replace("{{ check_in_date }}", checkInDateTime)
      .replace("{{ check_in_dateA }}", checkInDateTime)
      .replace("{{ check_out_date }}",checkOutDateTime)
      .replace("{{ hotel_name }}",details?.HotelId?.Hotelname)
      .replace("{{ hotel_address }}",details?.HotelId?.address)
      .replace("{{ contact_email }}",details?.HotelId?.email)
      .replace("{{ booking_id }}", details?.booking_id)
      .replace("{{ Booking_date }}", bookDateTime)
      .replace("{{ payment_method }}", details?.paymentId.paymentMode)
      .replace("{{ totalRooms }}", details?.numberOfRooms)
      .replace("{{ totalRoomsA }}", details?.numberOfRooms)
      .replace("{{ totalGuests }}", details?.numberOfGuests)
      .replace("{{ roomType }}", details?.roomsId?.roomType)
      .replace("{{ basePrice }}", details?.roomsId?.price)
      .replace("{{ totalRoomPrice }}", details?.basePrice)
      .replace("{{ subtotal }}", details?.basePrice)
      .replace("{{ subtotalAg }}", details?.basePrice)
      .replace("{{ grandTotal }}", details?.total_price)
      .replace("{{ grandTotalA }}", details?.total_price)
      .replace("{{ tax }}", details?.taxPrice)
      .replace("{{status}}", payStatus);

    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // Set the content of the page
    await page.setContent(filledTemplate);

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    // Close the browser
    await browser.close();
    console.log("Recipient email:", details?.email);
   
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });
    const mailOptions = {
      from: 'staykr990@gmail.com',
      to: details?.UserId?.email,
      subject: "Booking Confirmation and Invoice",
      html: `<html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation and Booking Invoice</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  border-radius: 5px;
                  overflow: hidden;
                  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
              }
              header {
                  background-color: #007bff;
                  color: #fff;
                  padding: 20px;
                  text-align: center;
              }
              header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
              }
              .content p {
                  margin: 10px 0;
              }
              .footer {
                  background-color: #f4f4f4;
                  padding: 20px;
                  text-align: center;
              }
              .footer p {
                  margin: 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <header>
                  <h1>Booking Invoice</h1>
              </header>
              <div class="content">
                  <p>Hi <strong>${details?.UserId?.name }</strong>,</p>
                  <p>Thank you for choosing StayKr! Your booking invoice is attached below.</p>
                  <h2>Booking Details:</h2>
                  <p><strong>Booking ID:</strong> ${details?._id }</p>
                  <p><strong>Booking Date:</strong> ${bookDateTime }</p>
                  <p><strong>Check-in Date:</strong> ${checkInDateTime}</p>
                  <p><strong>Check-out Date:</strong> ${checkOutDateTime}</p>
                  <p><strong>Hotel:</strong> ${details?.HotelId?.Hotelname}</p>
                  <p><strong>Room Type:</strong>Deluxe</p>
                  <p><strong>Total Rooms:</strong>${details?.numberOfRooms }</p>
                  <h2>Payment Details:</h2>
                  ${
                    details?.paymentId?.paymentMode === "Cash On Site"
                      ? "<p><strong>Payment Method:</strong> cash_at_hotel</p>"
                      : `
                          <p><strong>Payment Method:</strong>${details?.paymentId?.paymentMode}</p>
                          <p><strong>Razorpay Payment ID:</strong>${details?.paymentId?.razorpay_payment_id}</p>
                          <p><strong>Razorpay Order ID:</strong>${details?.paymentId.razorpay_order_id}</p>
                        `
                  }
                  <p><strong>Price per Room:</strong>${details?.roomsId?.price}</p>
                  <p><strong>Total Price:</strong>${details?.basePrice}</p>
                  <p><strong>Tax:</strong>${details?.taxPrice}</p>
                  <p><strong>Grand Total:</strong>${details?.totalPrice}</p>
                  <p>If you have any questions about this invoice, please contact us at <a href="https://hotelwedlock.com/backend">https://hotelwedlock.com/backend</a>.</p>
                  <p><strong>Please note:</strong> Your payment via Razorpay has been successfully processed. Kindly keep this email for your records.</p>
              </div>
              <div class="footer">
                  <p>Best regards,<br>The StayKr Team</p>
              </div>
          </div>
      </body>
      </html>`,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };
    const AdminmailOptions = {
      from: 'staykr990@gmail.com',
      to: 'staykr990@gmail.com',
      subject: "Booking Confirmation and Invoice",
      html: `<html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmation and Booking Invoice</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background-color: #f9f9f9;
                  margin: 0;
                  padding: 0;
              }
              .container {
                  max-width: 600px;
                  margin: 20px auto;
                  background-color: #fff;
                  border-radius: 5px;
                  overflow: hidden;
                  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
              }
              header {
                  background-color: #007bff;
                  color: #fff;
                  padding: 20px;
                  text-align: center;
              }
              header h1 {
                  margin: 0;
                  font-size: 24px;
              }
              .content {
                  padding: 20px;
              }
              .content p {
                  margin: 10px 0;
              }
              .footer {
                  background-color: #f4f4f4;
                  padding: 20px;
                  text-align: center;
              }
              .footer p {
                  margin: 0;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <header>
                  <h1>Booking Invoice</h1>
              </header>
              <div class="content">
                  <p>Hi <strong>${details?.UserId?.name }</strong>,</p>
                  <p>Thank you for choosing StayKr! Your booking invoice is attached below.</p>
                  <h2>Booking Details:</h2>
                  <p><strong>Booking ID:</strong> ${details?._id }</p>
                  <p><strong>Booking Date:</strong> ${bookDateTime }</p>
                  <p><strong>Check-in Date:</strong> ${checkInDateTime}</p>
                  <p><strong>Check-out Date:</strong> ${checkOutDateTime}</p>
                  <p><strong>Hotel:</strong> ${details?.HotelId?.Hotelname}</p>
                  <p><strong>Room Type:</strong>Deluxe</p>
                  <p><strong>Total Rooms:</strong>${details?.numberOfRooms }</p>
                  <h2>Payment Details:</h2>
                  ${
                    details?.paymentMode === "Cash On site"
                      ? "<p><strong>Payment Method:</strong> cash_at_hotel</p>"
                      : `
                          <p><strong>Payment Method:</strong>${details?.paymentId?.paymentMode}</p>
                          <p><strong>Razorpay Payment ID:</strong>${details?.paymentId?.razorpay_payment_id}</p>
                          <p><strong>Razorpay Order ID:</strong>${details?.paymentId?.razorpay_order_id}</p>
                        `
                  }
                  <p><strong>Price per Room:</strong>${details?.roomsId?.basePrice}</p>
                  <p><strong>Total Price:</strong>${details?.basePrice}</p>
                  <p><strong>Tax:</strong>${details?.taxPrice}</p>
                  <p><strong>Grand Total:</strong>${details?.totalPrice}</p>
                  <p>If you have any questions about this invoice, please contact us at <a href="https://hotelwedlock.com/backend">https://hotelwedlock.com/backend</a>.</p>
                  <p><strong>Please note:</strong> Your payment via Razorpay has been successfully processed. Kindly keep this email for your records.</p>
              </div>
              <div class="footer">
                  <p>Best regards,<br>The StayKr Team</p>
              </div>
          </div>
      </body>
      </html>`,
      attachments: [
        {
          filename: "invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    // Upload the PDF to S3
    const pdfUrl = await uploadInvoiceToS3(
      pdfBuffer,
      `invoices/${Booking._id}.pdf`
    );

    // Save PDF URL to the booking document
    await updateBookingWithPDFURL(Booking._id, pdfUrl);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    const AdminMail = await transporter.sendMail(AdminmailOptions);
    console.log("Email sent: " + AdminMail.response);
    console.log("paystatus",payStatus)
    if(details?.paymentId?.paymentMode==='Online Payment'){
      const stringRepresentation = details?.UserId?._id.toString();
      return res.redirect(`http://localhost:3000/ProfileInformation?User=${ stringRepresentation}`)
    }else{
      return res.status(200).send({success:true,msg:"booking is done PDF sent to your email successfully"});
    }
  } catch (err) {
    console.error(err);
   return res.status(500).json({ success: false, message: "Error generating PDF." });
  }
}

module.exports={SendOTPmail,sendPaymentSuccessEmail}


