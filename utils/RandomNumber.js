const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const { BookingModel } = require("../models/Booking.model");
const moment = require("moment-timezone");
const {RoomModel}=require("../models/RoomModel")
function generateRandomNumber(length) {

    const min = Math.pow(10, length - 1); // Minimum value
    const max = Math.pow(10, length) - 1; // Maximum value

    // Generate a random number within the defined range
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomNumber;
}

// generate Random string for password   
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}
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


// Schedule the cron job
const ScheduleRoomsAvailable = async () => {
  console.log("Cron job called");

  cron.schedule('0 10 * * *', async () => {
    try {
      const today = moment().startOf('day').toDate();
      const bookings = await BookingModel.find({ EndDate: { $lte: today }, isCanceled: false }).populate('HotelId');

      if (!bookings.length) {
        console.log("No active bookings found.");
        return;
      }

      let roomsToUpdate = [];

      // Iterate over each booking to collect room IDs
      bookings.forEach(booking => {
        if (Array.isArray(booking.roomsId)) {
          roomsToUpdate = roomsToUpdate.concat(booking.roomsId);
        } else {
          roomsToUpdate.push(booking.roomsId);
        }
      });

      // Remove duplicate room IDs, if any
      roomsToUpdate = [...new Set(roomsToUpdate)];

      // Update room availability for collected room IDs
      const updateResult = await RoomModel.updateMany(
        { _id: { $in: roomsToUpdate } },
        { isAvaliable: true }
      );

      console.log(`Room availability updated for ${roomsToUpdate.length} rooms.`);
    } catch (error) {
      console.error("Error updating room availability:", error);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Kolkata' // Set your timezone
  });
};



// Example usage:

module.exports={
    ScheduleRoomsAvailable,generateRandomNumber,generateRandomString,formatDate,formatTime
}