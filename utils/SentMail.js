const { BookingModel } = require("../models/Booking.model");
const nodemailer=require("nodemailer")
const config=require("../config/env");
const { uploadInvoiceToS3, updateBookingWithPDFURL } = require("./s3Config");
const fs = require("fs");
const { formatDate, formatTime } = require("./multer");
require('dotenv').config();
const ejs = require('ejs');
const path = require('path');
const { generateRandomNumber } = require("./RandomNumber");
const html_to_pdf = require('html-pdf-node');
const templatePath = path.join(__dirname, '../index.ejs');
console.log("templatepath",templatePath)

const SentUserMailPassword = async (userDetail,password) => {
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
      html: `<html><head><title>Welcome to StayKr</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);"><div style="text-align: center; margin-bottom: 20px;"><img src="https://staykr.com/static/media/Union.7389e099.png" alt="StayKr Logo" style="width: 150px;"></div><p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Hi <strong>${userDetail.name}</strong>,</p><p>Welcome to StayKr! Your Email An Password. :</p><div style="margin-bottom: 20px;"><p><strong>Email:</strong> ${userDetail.email}</p><p><strong>Password:</strong> ${password}</p></div><div style="text-align: center; margin-top: 30px;"><a href="http://localhost:3000" style="color: #fff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">Click here to log in</a></div><p>We recommend changing your password after logging in for the first time. If you have any questions or need assistance, please don't hesitate to contact our support team.</p></div><div style="margin-top: 30px; text-align: center; color: #777;"><p>Best regards,<br>The StayKr Team</p></div></body></html>`,
    };
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      if (info)
        console.log("Email sent:password " + info.response);
        return true
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({ success: false, msg: err.message })
    
  }

};

const SendOTPmail = async (userDetail,password,random, res) => {
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
      html: `<html><head><title>Welcome to StayKr</title></head><body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);"><div style="text-align: center; margin-bottom: 20px;"><img src="https://staykr.com/static/media/Union.7389e099.png" alt="StayKr Logo" style="width: 150px;"></div><p style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">Hi <strong>${userDetail.name}</strong>,</p><p>Welcome to StayKr! Otp for verifications. :</p><div style="margin-bottom: 20px;"><p><strong>Email:</strong> ${userDetail.email}</p><p><strong>OTP:</strong> ${random}</p></div><div style="text-align: center; margin-top: 30px;"><a href="http://localhost:3000" style="color: #fff; background-color: #007bff; padding: 10px 20px; text-decoration: none; border-radius: 5px; transition: background-color 0.3s;">Click here to log in</a></div><p>We recommend changing your password after logging in for the first time. If you have any questions or need assistance, please don't hesitate to contact our support team.</p></div><div style="margin-top: 30px; text-align: center; color: #777;"><p>Best regards,<br>The StayKr Team</p></div></body></html>`,
    };
    transporter.sendMail(mailOptions, async(err, info) => {
      if (err) console.log(err);
      if (info)
        await SentUserMailPassword(userDetail,password)
        return res
          .status(200)
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
    const details=await BookingModel.findOne({_id:Booking._id}).populate('UserId').populate('HotelId').populate('roomsId').populate('AppliedOfferId').populate('paymentId');
    const payStatus=details?.paymentId?.paymentMode==='Online Payment'? 'Paid' : 'Not paid'
      const bookingDate=formatDate( details?.timestamp);
      const bookingTime=formatTime( details?.timestamp);
      const checkInDate=formatDate( details?.StartingDate);
      const checkOutDate=formatDate(details?.EndDate);
      const bookDateTime=`${bookingDate} ${bookingTime}`
      const checkInDateTime=`${checkInDate} `
      const checkOutDateTime=`${checkOutDate}`
      const basepricetotal= parseFloat( details?.roomsId?.Price)
      const totalRooms= parseFloat( details?.numberOfRooms)

      const templateobj={
        guest_name: details?.UserId?.name,
        guest_email: details?.UserId?.email,
        guest_phone: details?.UserId?.phoneNumber,
        check_in_date: checkInDateTime,
        check_out_date: checkOutDateTime,
        hotel_name: details?.HotelId?.Hotelname,
        hotel_address: details?.HotelId?.address,
        contact_email: details?.HotelId?.email,
        booking_id: details?._id,
        Booking_date: bookDateTime,
        payment_method: details?.paymentId.paymentMode,
        totalRooms: details?.numberOfRooms,
        totalGuests: details?.numberOfGuests,
        roomType: details?.roomsId?.roomsType,
        basePrice: details?.roomsId?.Price,
        totalRoomPrice: details?.basePrice,
        subtotal: details?.basePrice,
        grandTotal: details?.finalPrice,
        discountprice: details?.offerDiscountMoney,
        tax: details?.taxPrice,
        priceHike: details?.priceHike,
        status: payStatus
    }
    console.log("templateobj",templateobj);
     let upload_path = './uploads/';
let file_name = generateRandomNumber(20) + "" + Date.now() + '.pdf';
let file_path = upload_path + file_name;
let options = { format: 'A4', path: file_path, printBackground: true, scale: .7 };
const pdfTemplate = await ejs.renderFile(
  templatePath,
    {
        templateobj:templateobj
    },
    {
        beautify: true,
        async: true
    }
  );
  let file = { content: pdfTemplate };
  await html_to_pdf.generatePdf(file, options).then(pdfBuffer => {
    console.log("PDF created");
  });
    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

const mailoptionsend=()=>{
  let paymentMethodHtml = "";
  if (details?.paymentId?.paymentMode === "Cash On site") {
    paymentMethodHtml = "<p><strong>Payment Method:</strong> cash_at_hotel</p>";
  } else {
    paymentMethodHtml = `
      <p><strong>Payment Method:</strong>${details?.paymentId?.paymentMode}</p>
      <p><strong>Razorpay Payment ID:</strong>${details?.paymentId?.razorpay_payment_id}</p>
      <p><strong>Razorpay Order ID:</strong>${details?.paymentId.razorpay_order_id}</p>
    `;
  }
  
  
  let discountmailopt;
  if(details?.offerDiscountMoney){
    discountmailopt=`<p><strong>Discount :</strong>${details?.offerDiscountMoney}</p>`
  }else{
    discountmailopt=``
  }
  
  return `<html lang="en">
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
            ${paymentMethodHtml}
                <p><strong>Price per Room:</strong>${details?.roomsId?.Price}</p>
                <p><strong>Total Price:</strong>${details?.basePrice}</p>
                <p><strong>Tax:</strong>${details?.gstAmount}</p>
                ${discountmailopt}
                <p><strong>Grand Total:</strong>${details?.finalPrice}</p>
                <p>If you have any questions about this invoice, please contact us at <a href="https://hotelwedlock.com/backend">https://hotelwedlock.com/backend</a>.</p>
                <p><strong>Please note:</strong> Your payment via Razorpay has been successfully processed. Kindly keep this email for your records.</p>
            </div>
            <div class="footer">
                <p>Best regards,<br>The StayKr Team</p>
            </div>
        </div>
    </body>
    </html>`
  
}
    const mailOptions = {
      from: 'staykr990@gmail.com',
      to: details?.UserId?.email,
      subject: "Booking Confirmation and Invoice",
      html: mailoptionsend(),
      attachments: [
        {
          filename: "invoice.pdf",
          path: file_path,
          contentType: "application/pdf",
        },
      ],
    };

    const AdminmailOptions = {
      from: 'staykr990@gmail.com',
      to: 'staykr990@gmail.com',
      subject: "Booking Confirmation and Invoice",
      html:mailoptionsend(),
      attachments: [
        {
          filename: "invoice.pdf",
          path: file_path,
          contentType: "application/pdf",
        },
      ],
    };

    const SendtToHotelMail= {
      from: 'staykr990@gmail.com',
      to:details?.email ,
      subject: "Booking Confirmation and Invoice",
      html:mailoptionsend(),
      attachments: [
        {
          filename: "invoice.pdf",
          path: file_path,
          contentType: "application/pdf",
        },
      ],
    };
    // Upload the PDF to S3
    const pdfUrl = await uploadInvoiceToS3(
      file_path,
      `invoices/${Booking._id}.pdf`
    );

    // Save PDF URL to the booking document
    await updateBookingWithPDFURL(Booking._id, pdfUrl);
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: " + info.response);
    const AdminMail = await transporter.sendMail(AdminmailOptions);
    console.log("Email sent: " + AdminMail.response);
   const SendToOwner=await transporter.sendMail(SendtToHotelMail);
   console.log("Email sent: " + SendToOwner.response);
    fs.unlink(file_path, function (err) {
      if (err) return console.log(err);
      console.log('file deleted successfully');
  });
      return res.status(200).send({success:true,msg:"booking is done PDF sent to your email successfully"});
  } catch (err) {
    console.error(err);
   return res.status(500).json({ success: false, message: "Error generating PDF." });
  }
}

const SendBookingCancellationEmails = async (BookingId, res) => {
  try {
    const details = await BookingModel.findOne({ _id: BookingId })
      .populate('UserId')
      .populate('HotelId')
      .populate('roomsId')
      .populate('AppliedOfferId')
      .populate('paymentId');

    const bookingDate = formatDate(details?.timestamp);
    const bookingTime = formatTime(details?.timestamp);
    const checkInDate = formatDate(details?.StartingDate);
    const checkOutDate = formatDate(details?.EndDate);
    const bookDateTime = `${bookingDate} ${bookingTime}`;
    const checkInDateTime = `${checkInDate}`;
    const checkOutDateTime = `${checkOutDate}`;

    const userCancellationEmailContent = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation Confirmation</title>
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
              background-color: #ff4d4d;
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
              <h1>Booking Cancellation</h1>
            </header>
            <div class="content">
              <p>Hi <strong>${details?.UserId?.name}</strong>,</p>
              <p>We regret to inform you that your booking has been canceled.</p>
              <h2>Booking Details:</h2>
              <p><strong>Booking ID:</strong> ${details?._id}</p>
              <p><strong>Booking Date:</strong> ${bookDateTime}</p>
              <p><strong>Check-in Date:</strong> ${checkInDateTime}</p>
              <p><strong>Check-out Date:</strong> ${checkOutDateTime}</p>
              <p><strong>Hotel:</strong> ${details?.HotelId?.Hotelname}</p>
              <p><strong>Hotel Address:</strong> ${details?.HotelId?.address}</p>
              <p>If you have any questions or need further assistance, please contact us at <a href="mailto:support@staykr.com">support@staykr.com</a>.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The StayKr Team</p>
            </div>
          </div>
        </body>
      </html>`;

    const ownerCancellationEmailContent = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation Notification</title>
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
              background-color: #ff4d4d;
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
              <h1>Booking Cancellation Notification</h1>
            </header>
            <div class="content">
              <p>Dear <strong>${details?.HotelId?.Hotelname}</strong>,</p>
              <p>We would like to inform you that a booking has been canceled.</p>
              <h2>Booking Details:</h2>
              <p><strong>Booking ID:</strong> ${details?._id}</p>
              <p><strong>Booking Date:</strong> ${bookDateTime}</p>
              <p><strong>Check-in Date:</strong> ${checkInDateTime}</p>
              <p><strong>Check-out Date:</strong> ${checkOutDateTime}</p>
              <h2>Guest Details:</h2>
              <p><strong>Name:</strong> ${details?.UserId?.name}</p>
              <p><strong>Email:</strong> ${details?.UserId?.email}</p>
              <p><strong>Phone Number:</strong> ${details?.UserId?.phoneNumber}</p>
              <p>If you have any questions or need further assistance, please contact us at <a href="mailto:support@staykr.com">support@staykr.com</a>.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The StayKr Team</p>
            </div>
          </div>
        </body>
      </html>`;

    const adminCancellationEmailContent = `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Booking Cancellation Notification</title>
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
              background-color: #ff4d4d;
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
              <h1>Booking Cancellation Notification</h1>
            </header>
            <div class="content">
              <p>Hi Admin,</p>
              <p>A booking has been canceled. Here are the details:</p>
              <h2>Booking Details:</h2>
              <p><strong>Booking ID:</strong> ${details?._id}</p>
              <p><strong>Booking Date:</strong> ${bookDateTime}</p>
              <p><strong>Check-in Date:</strong> ${checkInDateTime}</p>
              <p><strong>Check-out Date:</strong> ${checkOutDateTime}</p>
              <h2>Guest Details:</h2>
              <p><strong>Name:</strong> ${details?.UserId?.name}</p>
              <p><strong>Email:</strong> ${details?.UserId?.email}</p>
              <p><strong>Phone Number:</strong> ${details?.UserId?.phoneNumber}</p>
              <h2>Hotel Details:</h2>
              <p><strong>Hotel Name:</strong> ${details?.HotelId?.Hotelname}</p>
              <p><strong>Hotel Address:</strong> ${details?.HotelId?.address}</p>
              <p>If you have any questions or need further assistance, please contact us at <a href="mailto:support@staykr.com">support@staykr.com</a>.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br>The StayKr Team</p>
            </div>
          </div>
        </body>
      </html>`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMPT_HOST,
      port: process.env.SMPT_PORT,
      service: process.env.SMPT_SERVICE,
      auth: {
        user: process.env.SMPT_MAIL,
        pass: process.env.SMPT_PASSWORD,
      },
    });

    const userMailOptions = {
      from: 'staykr990@gmail.com',
      to: details?.UserId?.email,
      subject: "Booking Cancellation Confirmation",
      html: userCancellationEmailContent,
    };

    const ownerMailOptions = {
      from: 'staykr990@gmail.com',
      to: details?.HotelId?.email,
      subject: "Booking Cancellation Notification",
      html: ownerCancellationEmailContent,
    };

    const adminMailOptions = {
      from: 'staykr990@gmail.com',
      to: 'staykr990@gmail.com',
      subject: "Booking Cancellation Notification",
      html: adminCancellationEmailContent,
    };

    const userEmailInfo = await transporter.sendMail(userMailOptions);
    console.log("User Cancellation Email sent: " + userEmailInfo.response);

    const ownerEmailInfo = await transporter.sendMail(ownerMailOptions);
    console.log("Owner Cancellation Email sent: " + ownerEmailInfo.response);

    const adminEmailInfo = await transporter.sendMail(adminMailOptions);
    console.log("Admin Cancellation Email sent: " + adminEmailInfo.response);

    return res.status(200).send({ success: true, msg: "YOur Booking has been canceled" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error sending cancellation emails." });
  }
};


module.exports={SendBookingCancellationEmails,SentUserMailPassword,SendOTPmail,sendPaymentSuccessEmail}


