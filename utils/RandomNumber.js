const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');

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
const ScheduleRoomsAvailable=async()=>{
    console.log("cron job called")
    cron.schedule('0 10 * * *', async () => {
        try {
          // Retrieve the booking information from the database
          const booking = await BookingModel.findOne({ EndDate: { $lte: new Date() } }).populate('HotelId');
          
          if (!booking) {
            console.log("No active bookings found.");
            return;
          }
      
          // Retrieve the HotelId from the booking
          const HotelId = booking.HotelId;
      
          // Update the room availability for the hotel
          const findThisHotelRoom = await RoomModel.updateMany(
            { HotelId: HotelId },
            { isAvailable: true }
          );
      
          console.log("Room availability updated for hotel:", HotelId);
        } catch (error) {
          console.error("Error updating room availability:", error);
        }
      }, {
        scheduled: true,
        timezone: 'Asia/Kolkata' // Set your timezone
      });
}


// Example usage:

module.exports={
    ScheduleRoomsAvailable,generateRandomNumber,generateRandomString,formatDate,formatTime
}