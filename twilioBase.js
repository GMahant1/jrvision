require('dotenv').config();
const twilio = require('twilio');

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Create Twilio client
const client = new twilio(accountSid, authToken);

/**
 * Sends an SMS using Twilio
 * @param {string} to - Recipient's phone number (e.g., +1234567890)
 * @param {string} message - Text message to send
 * @returns {Promise} Resolves with Twilio response or rejects with an error
 */
const sendSMS = async (to, message) => {
  try {
    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to, // Ensure the recipient's number is in E.164 format (+1234567890)
    });
    console.log(`Message sent to ${to}: ${response.sid}`);
    return response;
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
};

module.exports = sendSMS;
