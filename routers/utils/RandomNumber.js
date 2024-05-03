const { v4: uuidv4 } = require('uuid');


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
// Example usage:

module.exports={
    generateRandomNumber,generateRandomString,formatDate,formatTime
}